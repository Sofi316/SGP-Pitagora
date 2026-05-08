package com.pitagora.backend.SGP_Pitagora.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    public SecurityConfiguration(JwtAuthenticationFilter jwtAuthFilter, AuthenticationProvider authenticationProvider) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // 1. Endpoints Públicos
                .requestMatchers("/api/auth/**").permitAll() 
                .requestMatchers("/api/auth/solicitar-recuperacion").permitAll() 
                .requestMatchers("/api/auth/reset-password").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                // 2. NUEVO: Reglas para Solicitudes y Evidencias 
                // Colocamos estas aquí para que cualquier usuario con TOKEN válido pueda operar
                // Nota: Usamos plural o singular según tus controladores actuales
                .requestMatchers("/api/solicitudes/**").authenticated() 
                .requestMatchers("/api/archivo-evidencia/**").authenticated()
                .requestMatchers("/api/obras/**").authenticated()
                .requestMatchers("/api/categorias/**").authenticated()
                .requestMatchers("/api/subcategorias/**").authenticated()

                // 3. Usuarios: Gestión y Listado (Restringido a ADMIN)
                .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/usuarios/todos").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/usuarios/*").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/usuarios/empresa/*").hasRole("ADMIN")
                .requestMatchers("/api/usuarios/**").hasRole("ADMIN")

                // 4. Tablas Maestras y Roles
                .requestMatchers(HttpMethod.GET, "/api/roles").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/roles/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/regiones/**", "/api/comunas/**", "/api/estados-solicitud/**").authenticated()
                .requestMatchers("/api/regiones/**", "/api/comunas/**", "/api/roles/**", "/api/estados-solicitud/**").hasRole("ADMIN")

                // 5. El resto de la API
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}