package com.pitagora.backend.SGP_Pitagora.config;
import org.springframework.security.config.Customizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
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
                // 1. Público 
                .requestMatchers("/api/auth/**").permitAll() 
                .requestMatchers("/api/auth/solicitar-recuperacion").permitAll() 
                .requestMatchers("/api/auth/reset-password").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                // 2. Usuarios: Primero la LISTA 
                // Usamos el método GET exacto para la lista completa
                .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/usuarios/todos").hasRole("ADMIN")
                
                // 3. Ver DETALLE de un usuario (Ej: /api/usuarios/5)
                .requestMatchers(HttpMethod.GET, "/api/usuarios/*").authenticated()
                .requestMatchers(HttpMethod.GET,"/api/usuarios/empresa/*").hasRole("ADMIN")
                // 4. CREAR, EDITAR, ELIMINAR usuarios: Solo ADMIN
                .requestMatchers("/api/usuarios/**").hasRole("ADMIN")


                // 5. Tablas Maestras (Regiones, Comunas, etc.)
                .requestMatchers(HttpMethod.GET, "/api/roles").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/roles/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/regiones/**", "/api/comunas/**", "/api/estados-solicitud/**").authenticated()
                .requestMatchers("/api/regiones/**", "/api/comunas/**", "/api/roles/**", "/api/estados-solicitud/**").hasRole("ADMIN")

                // 6. El resto de la API (Solicitudes, etc.)
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}