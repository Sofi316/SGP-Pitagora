package com.pitagora.backend.SGP_Pitagora.controller;

import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.dto.AuthRequest;
import com.pitagora.backend.SGP_Pitagora.dto.AuthResponse;
import com.pitagora.backend.SGP_Pitagora.dto.ResetPasswordDTO;
import com.pitagora.backend.SGP_Pitagora.service.JwtService;
import com.pitagora.backend.SGP_Pitagora.service.UsuarioService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioService usuarioService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, UsuarioService usuarioService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            // 1. Verificación manual para asegurar que no se oculte si el correo no existe
            UserDetails userDetails = usuarioService.loadUserByUsername(request.correo());
            Usuario usuarioExistente = (Usuario) userDetails;

            // 2. Verificación estricta de cuenta inactiva
            if (usuarioExistente.getActivo() != null && !usuarioExistente.getActivo()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("CUENTA_INACTIVA");
            }

            // 3. Autenticar credenciales
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.correo(), request.contrasena())
            );

            Usuario usuario = (Usuario) auth.getPrincipal();
            String nombreRol = (usuario.getRol() != null) ? usuario.getRol().getNombre() : "SIN_ROL";
            
            String token = jwtService.generateToken(usuario);
            return ResponseEntity.ok(new AuthResponse(token, nombreRol));
            
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("USUARIO_NO_ENCONTRADO");
        } catch (DisabledException | LockedException e) {
            // Spring Security detectó internamente que está desactivado
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("CUENTA_INACTIVA");
        } catch (BadCredentialsException e) {
            // La contraseña es incorrecta
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("CREDENCIALES_INVALIDAS");
        } catch (Exception e) {
            // Error general del servidor
            System.out.println(">>> ERROR CRÍTICO EN LOGIN: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("ERROR_INTERNO");
        }
    }
    
    @PostMapping("/solicitar-recuperacion")
    public ResponseEntity<String> solicitarRecuperacion(@RequestParam String correo) {
        usuarioService.solicitarRecuperacion(correo);
        return ResponseEntity.ok("Proceso iniciado.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDTO request) {
        if (request.nuevaPassword() == null || request.nuevaPassword().length() < 6) {
            return ResponseEntity.badRequest().body("La contraseña debe tener al menos 6 caracteres.");
        }

        try {
            usuarioService.cambiarPasswordConToken(request.token(), request.nuevaPassword());
            return ResponseEntity.ok("Contraseña actualizada exitosamente.");
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }
}