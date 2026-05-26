package com.pitagora.backend.SGP_Pitagora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.pitagora.backend.SGP_Pitagora.model.Categoria;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByNombreIgnoreCase(String nombre);
    
    @Query("SELECT c FROM Categoria c WHERE c.activo = true ORDER BY c.id DESC")
    List<Categoria> findByActivoTrue();
}