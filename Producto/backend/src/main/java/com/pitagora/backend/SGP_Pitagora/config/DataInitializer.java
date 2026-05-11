package com.pitagora.backend.SGP_Pitagora.config;

import com.pitagora.backend.SGP_Pitagora.model.Rol;
import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.repository.UsuarioRepository;
import com.pitagora.backend.SGP_Pitagora.repository.RolRepository; 
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

   @Bean
    CommandLineRunner initDatabase(UsuarioRepository usuarioRepository, 
                                RolRepository rolRepository, 
                                PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Buscar los roles que YA existen en la BD
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
            // 2. Crear Admin de prueba si no existe
            if (usuarioRepository.findByCorreo("admin@pitagora.cl").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setNombre("Admin");
                admin.setApellido("Sistema");
                admin.setRut("1-9");
                admin.setCorreo("admin@pitagora.cl");
                admin.setContrasena(passwordEncoder.encode("1234"));
                admin.setRol(adminRol);
                admin.setActivo(true);
                admin.setRecibe_notificaciones(true);
                
                usuarioRepository.save(admin);
            }

            // 3. Crear Cliente de prueba si no existe
            if (usuarioRepository.findByCorreo("cliente@test.cl").isEmpty()) {
                Usuario cliente = new Usuario();
                cliente.setNombre("Juan");
                cliente.setApellido("Prueba");
                cliente.setRut("33333");
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