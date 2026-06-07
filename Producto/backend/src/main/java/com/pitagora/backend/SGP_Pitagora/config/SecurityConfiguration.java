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
                .requestMatchers("/api/auth/**").permitAll() 
                .requestMatchers("/api/auth/solicitar-recuperacion").permitAll() 
                .requestMatchers("/api/auth/reset-password").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/swagger-resources/**", "/webjars/**").permitAll()
                .requestMatchers("/api/solicitudes/public/**").permitAll()
                
                .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/usuarios/todos").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/usuarios/filtrar").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/usuarios/*").authenticated() 
                .requestMatchers(HttpMethod.PUT, "/api/usuarios/*").authenticated() 
                .requestMatchers(HttpMethod.PUT, "/api/usuarios/reactivar/*").hasRole("ADMIN")
                .requestMatchers("/api/usuarios/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/roles").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/roles/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/regiones/**", "/api/comunas/**", "/api/estados-solicitud/**").authenticated()
                .requestMatchers("/api/regiones/**", "/api/comunas/**", "/api/roles/**", "/api/estados-solicitud/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/archivos-evidencia").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/archivos-evidencia/*").hasAnyRole("ADMIN", "CLIENTE") 
                .requestMatchers(HttpMethod.GET, "/api/archivos-evidencia/solicitud/*").hasAnyRole("ADMIN", "CLIENTE") 
                .requestMatchers(HttpMethod.POST, "/api/archivos-evidencia").hasAnyRole("ADMIN", "CLIENTE")
                .requestMatchers("/api/archivos-evidencia/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/categorias").hasAnyRole("ADMIN", "CLIENTE")
                .requestMatchers(HttpMethod.GET, "/api/categorias/*").hasAnyRole("ADMIN", "CLIENTE")
                .requestMatchers("/api/categorias/**").hasRole("ADMIN")

                .requestMatchers("/api/comunicaciones/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/empresas-clientes").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/empresas-clientes/*").hasAnyRole("ADMIN", "CLIENTE") 
                .requestMatchers("/api/empresas-clientes/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/obras").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/obras/*").hasAnyRole("ADMIN", "CLIENTE") 
                .requestMatchers(HttpMethod.GET, "/api/obras/empresa/*").hasAnyRole("ADMIN", "CLIENTE") 
                .requestMatchers("/api/obras/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/solicitudes").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/solicitudes/*").hasAnyRole("ADMIN", "CLIENTE") 
                .requestMatchers(HttpMethod.GET, "/api/solicitudes/usuario/*").hasAnyRole("ADMIN", "CLIENTE") 
                .requestMatchers(HttpMethod.GET, "/api/solicitudes/obra/*").hasAnyRole("ADMIN", "CLIENTE") 
                .requestMatchers(HttpMethod.POST, "/api/solicitudes").hasAnyRole("ADMIN", "CLIENTE")
                .requestMatchers(HttpMethod.PATCH, "/api/solicitudes/*/calificar").hasRole("CLIENTE")
                .requestMatchers("/api/solicitudes/**").authenticated()

                .requestMatchers(HttpMethod.GET, "/api/subcategorias").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/subcategorias/*").hasAnyRole("ADMIN", "CLIENTE")
                .requestMatchers(HttpMethod.GET, "/api/subcategorias/categoria/*").hasAnyRole("ADMIN", "CLIENTE")
                .requestMatchers("/api/subcategorias/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/tipos-evidencia").hasAnyRole("ADMIN", "CLIENTE")
                .requestMatchers(HttpMethod.GET, "/api/tipos-evidencia/*").hasAnyRole("ADMIN", "CLIENTE")
                .requestMatchers("/api/tipos-evidencia/**").hasRole("ADMIN")
                
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}