package com.pitagora.backend.SGP_Pitagora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pitagora.backend.SGP_Pitagora.model.Solicitud;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {
    
    // Métodos personalizados para filtrar solicitudes fácilmente
    List<Solicitud> findByUsuarioId(Long idUsuario);
    List<Solicitud> findByObraId(Long idObra);
    List<Solicitud> findByEstadoSolicitudId(Long idEstado);
}