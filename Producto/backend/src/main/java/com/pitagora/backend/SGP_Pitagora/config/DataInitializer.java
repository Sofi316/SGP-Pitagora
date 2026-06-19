package com.pitagora.backend.SGP_Pitagora.config;

import com.pitagora.backend.SGP_Pitagora.model.Rol;
import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.repository.UsuarioRepository;
import com.pitagora.backend.SGP_Pitagora.repository.RolRepository; 
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Value("${ADMIN_INIT_EMAIL}")
    private String adminEmail;

    @Value("${ADMIN_INIT_PASSWORD}")
    private String adminPassword;

    @Value("${ADMIN_INIT_RUT}")
    private String adminRut;

    @Bean
    @SuppressWarnings("unused")
    CommandLineRunner initDatabase(UsuarioRepository usuarioRepository, 
                                   RolRepository rolRepository, 
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            Rol adminRol = rolRepository.findByNombre("ADMIN")
                .orElseGet(() -> {
                    Rol nuevo = new Rol();
                    nuevo.setNombre("ADMIN");
                    return rolRepository.save(nuevo);
                });

            if (usuarioRepository.findByCorreo(adminEmail).isEmpty()) {
                Usuario admin = new Usuario();
                admin.setNombre("Admin");
                admin.setApellido("Sistema");
                admin.setRut(adminRut);
                admin.setCorreo(adminEmail);
                admin.setContrasena(passwordEncoder.encode(adminPassword));
                admin.setRol(adminRol);
                admin.setActivo(true);
                admin.setRecibe_notificaciones(true);
                
                usuarioRepository.save(admin);
            }

        };
    }
}
