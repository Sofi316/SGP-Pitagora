package com.pitagora.backend.SGP_Pitagora.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pitagora.backend.SGP_Pitagora.model.SubCategoria;

@Repository
public interface SubCategoriaRepository extends JpaRepository<SubCategoria, Long>{

       Optional<SubCategoria> findByNombreIgnoreCaseAndCategoriaId(String nombre, Long id);
       
       @Query("SELECT s FROM SubCategoria s " +
              "JOIN FETCH s.categoria " +
              "WHERE s.activo = true " +
              "ORDER BY s.id DESC")
       List<SubCategoria> findByActivoTrue();

       @Query("SELECT s FROM SubCategoria s " +
              "JOIN FETCH s.categoria c " +
              "WHERE c.id = :id AND s.activo = true " +
              "ORDER BY s.id DESC")
       List<SubCategoria> findByCategoriaIdAndActivoTrue(@Param("id") Long id);
}