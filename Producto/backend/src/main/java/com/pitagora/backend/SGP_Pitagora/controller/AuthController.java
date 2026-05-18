package com.pitagora.backend.SGP_Pitagora.controller;

import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.dto.AuthRequest;
import com.pitagora.backend.SGP_Pitagora.dto.AuthResponse;
import com.pitagora.backend.SGP_Pitagora.dto.ResetPasswordDTO;
import com.pitagora.backend.SGP_Pitagora.service.JwtService;
import com.pitagora.backend.SGP_Pitagora.service.UsuarioService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioService usuarioService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, UsuarioService usuarioService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioService=usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.correo(), request.contrasena())
            );

            Usuario usuario = (Usuario) auth.getPrincipal();
            
            
            String nombreRol = (usuario.getRol() != null) ? usuario.getRol().getNombre() : "SIN_ROL";
            
            String token = jwtService.generateToken(usuario);
            return ResponseEntity.ok(new AuthResponse(token, nombreRol));
            
        } catch (Exception e) {
            System.out.println(">>> ERROR CRÍTICO EN LOGIN: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body("Error: " + e.getMessage());
        }
    }
    @PostMapping("/solicitar-recuperacion")
    public ResponseEntity<String> solicitarRecuperacion(@RequestParam String correo) {
        usuarioService.solicitarRecuperacion(correo);
        return ResponseEntity.ok("Proceso iniciado.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDTO request) {
        usuarioService.cambiarPasswordConToken(request.token(), request.nuevaPassword());
        return ResponseEntity.ok("Contraseña actualizada.");
    }
}