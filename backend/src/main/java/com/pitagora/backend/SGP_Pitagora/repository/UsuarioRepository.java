package com.pitagora.backend.SGP_Pitagora.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pitagora.backend.SGP_Pitagora.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario,Long>{
    List<Usuario> findByActivoTrue();
    List<Usuario> findByEmpresaIdAndActivoTrue(Long id);
    Optional<Usuario> findByCorreo(String correo);
}
