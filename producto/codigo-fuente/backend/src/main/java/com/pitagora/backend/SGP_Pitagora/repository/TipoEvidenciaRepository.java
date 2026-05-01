package com.pitagora.backend.SGP_Pitagora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pitagora.backend.SGP_Pitagora.model.TipoEvidencia;

@Repository
public interface TipoEvidenciaRepository extends JpaRepository<TipoEvidencia, Long> {
    List<TipoEvidencia> findByNombre(String nombre);
}