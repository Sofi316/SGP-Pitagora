package com.pitagora.backend.SGP_Pitagora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pitagora.backend.SGP_Pitagora.model.Obra;

@Repository
public interface ObraRepository extends JpaRepository<Obra, Long>{

    @Query("SELECT o FROM Obra o " +
           "JOIN FETCH o.empresaCliente " +
           "JOIN FETCH o.comuna c " +
           "JOIN FETCH c.region " +
           "WHERE o.activo = true " +
           "ORDER BY o.id DESC")
    List<Obra> findByActivoTrue();

    @Query("SELECT o FROM Obra o " +
           "JOIN FETCH o.empresaCliente " +
           "JOIN FETCH o.comuna c " +
           "JOIN FETCH c.region " +
           "WHERE o.empresaCliente.id = :id AND o.activo = true " +
           "ORDER BY o.id DESC")
    List<Obra> findByEmpresaClienteIdAndActivoTrue(@Param("id") Long id);

    @Query("SELECT o FROM Obra o " +
           "LEFT JOIN FETCH o.usuarios " +
           "JOIN FETCH o.empresaCliente " +
           "JOIN FETCH o.comuna c " +
           "JOIN FETCH c.region " +
           "WHERE o.id = :id")
    Optional<Obra> findByIdWithUsuarios(@Param("id") Long id);
}