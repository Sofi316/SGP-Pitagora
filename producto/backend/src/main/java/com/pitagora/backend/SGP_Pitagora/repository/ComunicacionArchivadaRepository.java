package com.pitagora.backend.SGP_Pitagora.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pitagora.backend.SGP_Pitagora.model.ComunicacionArchivada;

@Repository
public interface ComunicacionArchivadaRepository extends JpaRepository<ComunicacionArchivada, Long>{

    @Query("""
        SELECT c
        FROM ComunicacionArchivada c
        WHERE c.solicitud.id = :id
        AND (CAST(:fechaInicio AS timestamp) IS NULL OR c.fechaEnvio >= :fechaInicio)
        AND (CAST(:fechaFin AS timestamp) IS NULL OR c.fechaEnvio <= :fechaFin)
        AND (
            :keyword IS NULL
            OR LOWER(c.asunto) LIKE :keyword
            OR LOWER(c.cuerpoMensaje) LIKE :keyword
            OR LOWER(c.remitente) LIKE :keyword
            OR LOWER(c.destinatario) LIKE :keyword
        )
    """)
    List<ComunicacionArchivada> filtrarComunicaciones(
            @Param("id") Long id,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin,
            @Param("keyword") String keyword
    );
}
