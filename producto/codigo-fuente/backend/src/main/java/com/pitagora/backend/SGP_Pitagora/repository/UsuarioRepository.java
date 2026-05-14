package com.pitagora.backend.SGP_Pitagora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pitagora.backend.SGP_Pitagora.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    List<Usuario> findByActivoTrue();

    Optional<Usuario> findByCorreo(String correo);

    Optional<Usuario> findByTokenRecuperacion(String tokenRecuperacion);

    @Query("SELECT u.correo FROM Usuario u JOIN u.obras o WHERE o.id = :obraId AND u.activo = true AND u.recibe_notificaciones = true")
    List<String> findCorreosByObraId(@Param("obraId") Long obraId);

    @Query("SELECT DISTINCT u FROM Usuario u " +
           "JOIN FETCH u.rol r " +
           "LEFT JOIN FETCH u.obras ob " + 
           "WHERE u.activo = true " +
           "AND (:empresaId IS NULL OR EXISTS (SELECT 1 FROM u.obras o1 WHERE o1.empresaCliente.id = :empresaId)) " +
           "AND (:obraId IS NULL OR EXISTS (SELECT 1 FROM u.obras o2 WHERE o2.id = :obraId)) " +
           "AND (CAST(:keyword AS text) IS NULL OR " + // <-- Casting para evitar error de bytea
           "LOWER(u.nombre) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')) OR " +
           "LOWER(u.apellido) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')) OR " +
           "LOWER(u.correo) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')) OR " +
           "LOWER(u.rut) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))")
    List<Usuario> filtrarUsuariosOptimizados(@Param("empresaId") Long empresaId, 
                                             @Param("obraId") Long obraId, 
                                             @Param("keyword") String keyword);
}