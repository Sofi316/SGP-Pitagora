package com.pitagora.backend.SGP_Pitagora.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
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
        Optional<Usuario> usuarioExistenteRut = usuarioRepository.findByRut(usuario.getRut());
        Optional<Usuario> usuarioExistenteCorreo = usuarioRepository.findByCorreo(usuario.getCorreo());

        if (usuarioExistenteRut.isPresent()) {
            Usuario existente = usuarioExistenteRut.get();
            
            if (Boolean.TRUE.equals(existente.getActivo())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un usuario activo con el RUT: " + usuario.getRut());
            } else {
                if (usuarioExistenteCorreo.isPresent() && !usuarioExistenteCorreo.get().getId().equals(existente.getId())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "El RUT está inactivo para reactivación, pero el correo ya está en uso por otra cuenta.");
                }
                
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Usuario inactivo encontrado. Use la opción de reactivación.");
            }
        }

        if (usuarioExistenteCorreo.isPresent()) {
            Usuario existenteCorreo = usuarioExistenteCorreo.get();
            if (Boolean.TRUE.equals(existenteCorreo.getActivo())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El email proporcionado ya pertenece a una cuenta activa en el sistema.");
            } else {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El email proporcionado ya pertenece a una cuenta que se encuentra desactivada.");
            }
        }

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
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró el usuario"));
    }

    public Usuario reactivarUsuario(String rutPath, Usuario usuarioModificado) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByRut(rutPath);
        
        if (usuarioOpt.isEmpty()) {
            usuarioOpt = usuarioRepository.findByCorreo(usuarioModificado.getCorreo());
        }

        Usuario usuarioReactivado = usuarioOpt
            .map(usuarioAEditar -> {
                if (!usuarioAEditar.getCorreo().equals(usuarioModificado.getCorreo())) {
                    Optional<Usuario> usuarioConCorreo = usuarioRepository.findByCorreo(usuarioModificado.getCorreo());
                    if (usuarioConCorreo.isPresent() && !usuarioConCorreo.get().getId().equals(usuarioAEditar.getId())) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "No se puede reactivar: el email " + usuarioModificado.getCorreo() + " ya está registrado en otra cuenta.");
                    }
                }

                if (!usuarioAEditar.getRut().equals(usuarioModificado.getRut())) {
                    Optional<Usuario> usuarioConRut = usuarioRepository.findByRut(usuarioModificado.getRut());
                    if (usuarioConRut.isPresent() && !usuarioConRut.get().getId().equals(usuarioAEditar.getId())) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "No se puede reactivar: el nuevo RUT " + usuarioModificado.getRut() + " ya pertenece a otra cuenta.");
                    }
                }
                
                actualizarCamposBase(usuarioAEditar, usuarioModificado);
                normalizarRelaciones(usuarioAEditar);
                usuarioAEditar.setActivo(true);

                Optional.ofNullable(usuarioModificado.getContrasena())
                    .filter(pass -> !pass.isBlank())
                    .map(passwordEncoder::encode)
                    .ifPresent(usuarioAEditar::setContrasena);

                return usuarioRepository.save(usuarioAEditar);
            })
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró un usuario inactivo con esos datos para reactivar."));

        if (Boolean.TRUE.equals(usuarioReactivado.getRecibe_notificaciones())) {
            String contrasenaPlana = usuarioModificado.getContrasena();
            new Thread(() -> {
                try {
                    enviarEmailReactivacion(usuarioReactivado.getCorreo(), contrasenaPlana);
                } catch (Exception e) {
                    System.err.println(e.getMessage());
                }
            }).start();
        }

        return usuarioReactivado;
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
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="cid:logoPitagora" alt="Logo Pitagora" style="max-width: 150px; height: auto;" />
                </div>
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
        helper.addInline("logoPitagora", new ClassPathResource("logo_pitagora.png"));
        mailSender.send(message);
    }

    private void enviarEmailReactivacion(String destinatario, String contrasenaPlana) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(mailFrom);
        helper.setTo(destinatario);
        helper.setSubject("Reactivación de Cuenta - SGP Constructora Pitagora");

        String passwordDisplay = (contrasenaPlana != null && !contrasenaPlana.isBlank()) ? contrasenaPlana : "*(Mantenida desde su último acceso)*";

        String contenidoHtml = """
            <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="cid:logoPitagora" alt="Logo Pitagora" style="max-width: 150px; height: auto;" />
                </div>
                <h2 style="color: #0d3b66; text-align: center; border-bottom: 2px solid #aec4d6; padding-bottom: 10px;">Reactivación de Cuenta</h2>
                <p style="color: #333333; font-size: 15px;">Su cuenta en SGP Pitagora ha sido reactivada exitosamente. A continuación, le enviamos sus credenciales de acceso para ingresar a la plataforma:</p>
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
            """.formatted(destinatario, passwordDisplay);

        helper.setText(contenidoHtml, true);
        helper.addInline("logoPitagora", new ClassPathResource("logo_pitagora.png"));
        mailSender.send(message);
    }

    private void enviarEmailHTML(String destinatario, String token) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(mailFrom);
        helper.setTo(destinatario);
        helper.setSubject("Recuperación de Contraseña - SGP Constructora Pitagora");

        String contenidoHtml = """
            <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="cid:logoPitagora" alt="Logo Pitagora" style="max-width: 150px; height: auto;" />
                </div>
                <h2 style="color: #0d3b66; text-align: center; border-bottom: 2px solid #aec4d6; padding-bottom: 10px;">Restablecer Contraseña</h2>
                <p style="color: #333333; font-size: 15px;">Has solicitado recuperar tu acceso a la plataforma <strong>SGP Pitagora</strong>.</p>
                <p style="color: #333333; font-size: 15px;">Puedes restablecer tu contraseña haciendo clic en el siguiente enlace:</p>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="http://localhost:3000/reset-password?token=%s" 
                    style="background-color: #0d3b66; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Cambiar Contraseña
                    </a>
                </div>
                
                <p style="font-size: 13px; color: #7f8c8d; text-align: center;">Este enlace expirará en 15 minutos. Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="font-size: 12px; color: #bdc3c7; text-align: center; margin-top: 15px;">Constructora Pitagora - Sistema de Gestión de Postventa</p>
            </div>
            """.formatted(token);

        helper.setText(contenidoHtml, true);
        helper.addInline("logoPitagora", new ClassPathResource("logo_pitagora.png"));
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