package com.pitagora.backend.SGP_Pitagora.config;

import com.pitagora.backend.SGP_Pitagora.model.Rol;
import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.repository.UsuarioRepository;
import com.pitagora.backend.SGP_Pitagora.repository.RolRepository; // Asumo que tienes este repo
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
            .orElseThrow(() -> new RuntimeException("Error: Rol ADMIN no encontrado en la base de datos."));
            
        Rol clienteRol = rolRepository.findByNombre("CLIENTE")
            .orElseThrow(() -> new RuntimeException("Error: Rol CLIENTE no encontrado en la base de datos."));

        // 2. Crear Admin de prueba si no existe
        if (usuarioRepository.findByCorreo("admin@pitagora.cl").isEmpty()) {
            Usuario admin = new Usuario();
            admin.setNombre("Admin");
            admin.setApellido("Sistema");
            admin.setRut("1-9");
            admin.setCorreo("admin@pitagora.cl");
            admin.setContrasena(passwordEncoder.encode("admin123"));
            admin.setRol(adminRol);
            admin.setActivo(true);
            admin.setRecibe_notificaciones(true);
            
            usuarioRepository.save(admin);
            System.out.println("Usuario Admin creado correctamente.");
        }

        // 3. Crear Cliente de prueba si no existe
        if (usuarioRepository.findByCorreo("cliente@test.cl").isEmpty()) {
            Usuario cliente = new Usuario();
            cliente.setNombre("Juan");
            cliente.setApellido("Prueba");
            cliente.setRut("2-7");
            cliente.setCorreo("cliente@test.cl");
            cliente.setContrasena(passwordEncoder.encode("cliente123"));
            cliente.setRol(clienteRol);
            cliente.setActivo(true);
            cliente.setRecibe_notificaciones(false);
            
            // Si el cliente necesita estar asociado a una empresa, búscala aquí e impleméntala
            // cliente.setEmpresa(empresaRepository.findById(1L).get());

            usuarioRepository.save(cliente);
            System.out.println("Usuario Cliente creado correctamente.");
        }
    };
}
}