package com.pitagora.backend.SGP_Pitagora.service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;
import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.repository.UsuarioRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.persistence.EntityNotFoundException;

@Service
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    public UsuarioService(UsuarioRepository usuarioRepository, 
                          PasswordEncoder passwordEncoder, 
                          JavaMailSender mailSender) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByCorreo(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + email));
    }

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public List<Usuario> findAllActivas() {
        return usuarioRepository.findByActivoTrue(); 
    }

    public Usuario findById(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }
    public List<Usuario> listarPorEmpresa(Long id){
        return usuarioRepository.findByEmpresaIdAndActivoTrue(id);
    }

    public Usuario save(Usuario usuario){
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        return usuarioRepository.save(usuario);
    }

    public Usuario update(Long id, Usuario usuarioModificado) {
        return usuarioRepository.findById(id)
            .map(usuarioAEditar -> {
                actualizarCamposBase(usuarioAEditar, usuarioModificado);

                Optional.ofNullable(usuarioModificado.getContrasena())
                    .filter(pass -> !pass.isBlank())
                    .map(passwordEncoder::encode)
                    .ifPresent(usuarioAEditar::setContrasena);

                return usuarioRepository.save(usuarioAEditar);
            })
            .orElseThrow(() -> new EntityNotFoundException("No se encontró el usuario"));
    }

    private void actualizarCamposBase(Usuario destino, Usuario origen) {
        destino.setNombre(origen.getNombre());
        destino.setApellido(origen.getApellido());
        destino.setRut(origen.getRut());
        destino.setCorreo(origen.getCorreo());
        destino.setCelular(origen.getCelular());
        destino.setCargo(origen.getCargo());
        destino.setRecibe_notificaciones(origen.getRecibe_notificaciones());
        destino.setActivo(origen.getActivo());
        destino.setRol(origen.getRol());
        destino.setEmpresa(origen.getEmpresa());
    }
    
    public void delete(Long id) {
    usuarioRepository.findById(id)
        .map(usuario -> {
            usuario.setActivo(false);
            usuario.setRecibe_notificaciones(false);
            return usuarioRepository.save(usuario);
        })
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "No se puede eliminar, ID no existe"
        ));
    }

    private void enviarEmailHTML(String destinatario, String token) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(destinatario);
        helper.setSubject("Recuperación de Contraseña - Constructora Pitágoras");

    
        String contenidoHtml = """
            <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                <h2 style="color: #364a5e;">Restablecer Contraseña</h2>
                <p>Has solicitado recuperar tu acceso al sistema <strong>SGP Pitágora</strong>.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:8080/reset-password?token=%s" 
                    style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Cambiar Contraseña
                    </a>
                </div>
                <p style="font-size: 0.8em; color: #7f8c8d;">Este enlace expirará en 15 minutos.</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p style="font-size: 0.7em; color: #bdc3c7;">Constructora Pitágoras - Sistema de Gestión de Postventa</p>
            </div>
            """.formatted(token);

        helper.setText(contenidoHtml, true); 
        mailSender.send(message);
    }
    public void solicitarRecuperacion(String correo) {
        usuarioRepository.findByCorreo(correo).ifPresent(usuario -> {
            String token = UUID.randomUUID().toString();
            usuario.setTokenRecuperacion(token);
            usuario.setTokenExpiracion(LocalDateTime.now().plusMinutes(15));
            usuarioRepository.save(usuario);

            try {
                // Se envía el correo al usuario encontrado
                enviarEmailHTML(usuario.getCorreo(), token);
            } catch (MessagingException e) {
                // Manejo de error de envío
                throw new RuntimeException("Error al enviar el email de recuperación", e);
            }
        });
    }

    public void cambiarPasswordConToken(String token, String nuevaPassword) {
        usuarioRepository.findByTokenRecuperacion(token)
            .filter(u -> u.getTokenExpiracion().isAfter(LocalDateTime.now()))
            .map(u -> {
                u.setContrasena(passwordEncoder.encode(nuevaPassword));
                u.setTokenRecuperacion(null); // Limpiar el token tras el uso
                u.setTokenExpiracion(null);
                return usuarioRepository.save(u);
            })
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido o expirado"));
    }
    


}
