package com.pitagora.backend.SGP_Pitagora.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pitagora.backend.SGP_Pitagora.model.Rol;
import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.repository.RolRepository;
import com.pitagora.backend.SGP_Pitagora.repository.UsuarioRepository;

@Configuration
public class DataInitializer {

    @Value("${ADMIN_INIT_EMAIL}")
    private String adminEmail;

    @Value("${ADMIN_INIT_PASSWORD}")
    private String adminPassword;

    @Value("${ADMIN_INIT_RUT}")
    private String adminRut;

    @Bean
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

            Rol clienteRol = rolRepository.findByNombre("CLIENTE")
                .orElseGet(() -> {
                    Rol nuevo = new Rol();
                    nuevo.setNombre("CLIENTE");
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

            if (usuarioRepository.findByCorreo("cliente@test.cl").isEmpty()) {
                Usuario cliente = new Usuario();
                cliente.setNombre("Juan");
                cliente.setApellido("Prueba");
                cliente.setRut("33333333-3");
                cliente.setCorreo("cliente@test.cl");
                cliente.setContrasena(passwordEncoder.encode("1234"));
                cliente.setRol(clienteRol);
                cliente.setActivo(true);
                cliente.setRecibe_notificaciones(true);

                usuarioRepository.save(cliente);
            }
        };
    }
}
