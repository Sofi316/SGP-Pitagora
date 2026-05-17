package com.pitagora.backend.SGP_Pitagora.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.Obra;
import com.pitagora.backend.SGP_Pitagora.model.Rol;
import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.repository.ObraRepository;
import com.pitagora.backend.SGP_Pitagora.repository.RolRepository;
import com.pitagora.backend.SGP_Pitagora.repository.UsuarioRepository;

import jakarta.mail.internet.MimeMessage;
import jakarta.persistence.EntityNotFoundException;

@Service
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final ObraRepository obraRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String mailFrom;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          RolRepository rolRepository,
                          ObraRepository obraRepository,
                          PasswordEncoder passwordEncoder,
                          JavaMailSender mailSender) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.obraRepository = obraRepository;
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

    public List<Usuario> filtrarUsuarios(Long empresaId, Long obraId, String keyword) {
        String busqueda = (keyword == null || keyword.trim().isEmpty()) ? null : keyword;
        return usuarioRepository.filtrarUsuariosOptimizados(empresaId, obraId, busqueda);
    }

    @Transactional
    public Usuario save(Usuario usuario) {
        if (usuario.getActivo() == null) {
            usuario.setActivo(true);
        }
        if (usuario.getRecibe_notificaciones() == null) {
            usuario.setRecibe_notificaciones(true);
        }

        normalizarRelaciones(usuario);

        String contrasenaPlana = usuario.getContrasena();
        usuario.setContrasena(passwordEncoder.encode(contrasenaPlana));
        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        
        if (Boolean.TRUE.equals(usuarioGuardado.getRecibe_notificaciones())) {
            new Thread(() -> {
                try {
                    enviarEmailBienvenida(usuarioGuardado.getCorreo(), contrasenaPlana);
                } catch (Exception e) {
                    System.err.println(e.getMessage());
                }
            }).start();
        }
        
        return usuarioGuardado;
    }

    public Usuario update(Long id, Usuario usuarioModificado) {
        return usuarioRepository.findById(id)
            .map(usuarioAEditar -> {
                actualizarCamposBase(usuarioAEditar, usuarioModificado);
                normalizarRelaciones(usuarioAEditar);

                Optional.ofNullable(usuarioModificado.getContrasena())
                    .filter(pass -> !pass.isBlank())
                    .map(passwordEncoder::encode)
                    .ifPresent(usuarioAEditar::setContrasena);

                return usuarioRepository.save(usuarioAEditar);
            })
            .orElseThrow(() -> new EntityNotFoundException("No se encontró el usuario"));
    }

    public Usuario reactivarUsuario(String rut, Usuario usuarioModificado) {
        return usuarioRepository.findByRut(rut)
            .map(usuarioAEditar -> {
                actualizarCamposBase(usuarioAEditar, usuarioModificado);
                normalizarRelaciones(usuarioAEditar);
                usuarioAEditar.setActivo(true);

                Optional.ofNullable(usuarioModificado.getContrasena())
                    .filter(pass -> !pass.isBlank())
                    .map(passwordEncoder::encode)
                    .ifPresent(usuarioAEditar::setContrasena);

                return usuarioRepository.save(usuarioAEditar);
            })
            .orElseThrow(() -> new EntityNotFoundException("No se encontró el usuario con RUT: " + rut));
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
        destino.setObras(origen.getObras());
    }

    private void normalizarRelaciones(Usuario usuario) {
        if (usuario.getRol() == null || usuario.getRol().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol es obligatorio para el usuario.");
        }

        Rol rolExistente = rolRepository.findById(usuario.getRol().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol no válido."));
        usuario.setRol(rolExistente);

        if (usuario.getObras() == null || usuario.getObras().isEmpty()) {
            usuario.setObras(new ArrayList<>());
        } else {
            List<Long> obraIds = usuario.getObras().stream()
                    .map(Obra::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            if (!obraIds.isEmpty()) {
                List<Obra> obrasExistentes = obraRepository.findAllById(obraIds);
                if (obrasExistentes.size() != obraIds.size()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Alguna obra seleccionada no existe.");
                }
                usuario.setObras(obrasExistentes);
            } else {
                usuario.setObras(new ArrayList<>());
            }
        }
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

    private void enviarEmailBienvenida(String destinatario, String contrasenaPlana) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(mailFrom);
        helper.setTo(destinatario);
        helper.setSubject("Bienvenido a SGP Pitagora - Credenciales de Acceso");

        String contenidoHtml = """
            <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <h2 style="color: #0d3b66; text-align: center; border-bottom: 2px solid #aec4d6; padding-bottom: 10px;">Bienvenido a SGP Pitagora</h2>
                <p style="color: #333333; font-size: 15px;">Su cuenta ha sido creada exitosamente. A continuación, le enviamos sus credenciales de acceso para ingresar a la plataforma:</p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 25px 0; border-left: 5px solid #7e9ab2;">
                    <p style="margin: 8px 0; font-size: 15px; color: #364a5e;"><strong>Correo Electrónico:</strong> %s</p>
                    <p style="margin: 8px 0; font-size: 15px; color: #364a5e;"><strong>Contraseña:</strong> %s</p>
                </div>
                <p style="color: #333333; font-size: 15px;">Puede acceder al sistema haciendo clic en el siguiente enlace:</p>
                <div style="text-align: center; margin: 35px 0;">
                    <a href="http://localhost:3000" 
                    style="background-color: #0d3b66; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Ingresar al Sistema
                    </a>
                </div>
                <p style="font-size: 13px; color: #7f8c8d; text-align: center;">Por motivos de seguridad, le recomendamos cambiar su contraseña una vez que ingrese al sistema.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="font-size: 12px; color: #bdc3c7; text-align: center; margin-top: 15px;">Constructora Pitagora - Sistema de Gestión de Postventa</p>
            </div>
            """.formatted(destinatario, contrasenaPlana);

        helper.setText(contenidoHtml, true);
        mailSender.send(message);
    }

    private void enviarEmailHTML(String destinatario, String token) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(mailFrom);
        helper.setTo(destinatario);
        helper.setSubject("Recuperación de Contraseña - Constructora Pitágoras");

        String contenidoHtml = """
            <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                <h2 style="color: #364a5e;">Restablecer Contraseña</h2>
                <p>Has solicitado recuperar tu acceso al sistema <strong>SGP Pitagora</strong>.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3000/reset-password?token=%s" 
                    style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Cambiar Contraseña
                    </a>
                </div>
                <p style="font-size: 0.8em; color: #7f8c8d;">Este enlace expirará en 15 minutos.</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p style="font-size: 0.7em; color: #bdc3c7;">Constructora Pitagora - Sistema de Gestión de Postventa</p>
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

            new Thread(() -> {
                try {
                    enviarEmailHTML(usuario.getCorreo(), token);
                } catch (Exception e) {
                    System.err.println(e.getMessage());
                }
            }).start();
        });
    }

    public void cambiarPasswordConToken(String token, String nuevaPassword) {
        usuarioRepository.findByTokenRecuperacion(token)
            .filter(u -> u.getTokenExpiracion().isAfter(LocalDateTime.now()))
            .map(u -> {
                u.setContrasena(passwordEncoder.encode(nuevaPassword));
                u.setTokenRecuperacion(null);
                u.setTokenExpiracion(null);
                return usuarioRepository.save(u);
            })
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido o expirado"));
    }
}