package com.pitagora.backend.SGP_Pitagora.controller;

import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.model.dto.AuthRequest;
import com.pitagora.backend.SGP_Pitagora.model.dto.AuthResponse;
import com.pitagora.backend.SGP_Pitagora.service.JwtService;
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

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.correo(), request.contrasena())
        );

        Usuario usuario = (Usuario) auth.getPrincipal();
        String token = jwtService.generateToken(usuario);

        return ResponseEntity.ok(new AuthResponse(token, usuario.getRol().getNombre()));
    }
}