package com.pitagora.backend.SGP_Pitagora.repository;

import java.util.List;

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
           "WHERE o.activo = true")
    List<Obra> findByActivoTrue();

    @Query("SELECT o FROM Obra o " +
           "JOIN FETCH o.empresaCliente " +
           "JOIN FETCH o.comuna c " +
           "JOIN FETCH c.region " +
           "WHERE o.empresaCliente.id = :id AND o.activo = true")
    List<Obra> findByEmpresaClienteIdAndActivoTrue(@Param("id") Long id);
}
