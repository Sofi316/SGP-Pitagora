package com.pitagora.backend.SGP_Pitagora.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Desactiva la protección CSRF (necesario para Postman sin autenticación)
            .csrf(csrf -> csrf.disable())
            
            // Permite todas las peticiones a todas las rutas
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )
            
            // Si en el futuro quieres deshabilitar el login form por defecto, puedes hacerlo aquí
            // (pero el permitAll debería ser suficiente por ahora)
            ; 
            
        return http.build();
    }
}