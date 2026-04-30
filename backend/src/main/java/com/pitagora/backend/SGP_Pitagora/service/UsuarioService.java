package com.pitagora.backend.SGP_Pitagora.service;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.repository.UsuarioRepository;

public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder){
        this.usuarioRepository=usuarioRepository;
        this.passwordEncoder = passwordEncoder;
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

    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }
    public List<Usuario> listarPorEmpresa(Long id){
        return usuarioRepository.findByEmpresaIdAndActivoTrue(id);
    }

    public Usuario save(Usuario usuario){
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        return usuarioRepository.save(usuario);
    }

    public Usuario update(Long id, Usuario usuarioModificado){
 
        Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);

        if (usuarioExistente.isPresent()){
           
            Usuario usuarioAEditar = usuarioExistente.get();

            usuarioAEditar.setNombre(usuarioModificado.getNombre());
            usuarioAEditar.setApellido(usuarioModificado.getApellido());
            usuarioAEditar.setRut(usuarioModificado.getRut());
            usuarioAEditar.setCorreo(usuarioModificado.getCorreo());
            usuarioAEditar.setCelular(usuarioModificado.getCelular());
            usuarioAEditar.setCargo(usuarioModificado.getCargo());
            usuarioAEditar.setRecibe_notificaciones(usuarioModificado.getRecibe_notificaciones());
            usuarioAEditar.setActivo(usuarioModificado.getActivo());
            usuarioAEditar.setRol(usuarioModificado.getRol());
            usuarioAEditar.setEmpresa(usuarioModificado.getEmpresa());

            if (usuarioModificado.getContrasena() != null && !usuarioModificado.getContrasena().isEmpty()) {
                usuarioAEditar.setContrasena(passwordEncoder.encode(usuarioModificado.getContrasena()));
            }
            return usuarioRepository.save(usuarioAEditar);

        }else{
            return null;
        }
    }
    public boolean delete(Long id) {
        Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);

        if (usuarioExistente.isPresent()) {
            Usuario usuario = usuarioExistente.get();
            usuario.setActivo(false);
            usuarioRepository.save(usuario);
            return true;
        }
        return false;
    } 
}
