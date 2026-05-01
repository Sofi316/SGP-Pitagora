package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.repository.SolicitudRepository;

@Service
public class SolicitudService {

    // Le agregamos 'final' por buena práctica de inyección
    private final SolicitudRepository solicitudRepository;

    public SolicitudService(SolicitudRepository solicitudRepository) {
        this.solicitudRepository = solicitudRepository;
    }

    public List<Solicitud> obtenerTodas() {
        return solicitudRepository.findAll();
    }

    public Solicitud obtenerPorId(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));
    }

    public List<Solicitud> obtenerPorUsuario(Long id) {
        return solicitudRepository.findByUsuarioId(id);
    }

    public List<Solicitud> obtenerPorObra(Long id) {
        return solicitudRepository.findByObraId(id);
    }

    public Solicitud guardar(Solicitud solicitud) {
        return solicitudRepository.save(solicitud);
    }

    public Solicitud update(Long id, Solicitud detalles) {
        Solicitud solicitudActualizada = solicitudRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));
        
        solicitudActualizada.setFechaHallazgo(detalles.getFechaHallazgo());
        solicitudActualizada.setDescripcion(detalles.getDescripcion());
        solicitudActualizada.setUbicacionExacta(detalles.getUbicacionExacta());
        solicitudActualizada.setTokenValidacion(detalles.getTokenValidacion());
        solicitudActualizada.setFechaFirma(detalles.getFechaFirma());
        solicitudActualizada.setComentarioCierre(detalles.getComentarioCierre());
        solicitudActualizada.setActivo(detalles.getActivo());
        
        solicitudActualizada.setEstadoSolicitud(detalles.getEstadoSolicitud());
        solicitudActualizada.setSubCategoria(detalles.getSubCategoria());
        solicitudActualizada.setUsuario(detalles.getUsuario());
        solicitudActualizada.setObra(detalles.getObra());

        return solicitudRepository.save(solicitudActualizada);
    }

    public boolean delete(Long id) {
        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));

        solicitud.setActivo(false);
        solicitudRepository.save(solicitud);
        return true;
    }

    public Solicitud registrarCalificacion(Long id, Integer estrellas) {
        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));

        if (estrellas == null || estrellas < 1 || estrellas > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Calificación inválida");
        }
        
        solicitud.setCalificacion(estrellas);
        return solicitudRepository.save(solicitud); 
    }
}