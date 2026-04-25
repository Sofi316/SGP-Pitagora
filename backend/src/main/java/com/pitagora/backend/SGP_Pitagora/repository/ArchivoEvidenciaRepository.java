package com.pitagora.backend.SGP_Pitagora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pitagora.backend.SGP_Pitagora.model.ArchivoEvidencia;

@Repository
public interface ArchivoEvidenciaRepository extends JpaRepository<ArchivoEvidencia, Long> {
    
    // Método personalizado muy útil para traer las evidencias de un ticket/solicitud
    List<ArchivoEvidencia> findBySolicitudId(Long idSolicitud);
}