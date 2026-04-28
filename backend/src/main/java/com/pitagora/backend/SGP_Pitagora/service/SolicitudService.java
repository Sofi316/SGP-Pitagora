package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
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

    public Optional<Solicitud> obtenerPorId(Long id) {
        return solicitudRepository.findById(id);
    }

    public List<Solicitud> obtenerPorUsuario(Long idUsuario) {
        return solicitudRepository.findByUsuarioId(idUsuario);
    }

    public List<Solicitud> obtenerPorObra(Long idObra) {
        return solicitudRepository.findByObraId(idObra);
    }

    public Solicitud guardar(Solicitud solicitud) {
        return solicitudRepository.save(solicitud);
    }

    public Solicitud update(Long id, Solicitud detalles) {
        Optional<Solicitud> solicitudExistente = solicitudRepository.findById(id);

        if (solicitudExistente.isPresent()) {
            Solicitud solicitudActualizada = solicitudExistente.get();
            
            // Actualizamos los campos de texto y fechas
            solicitudActualizada.setFechaHallazgo(detalles.getFechaHallazgo());
            solicitudActualizada.setDescripcion(detalles.getDescripcion());
            solicitudActualizada.setUbicacionExacta(detalles.getUbicacionExacta());
            solicitudActualizada.setTokenValidacion(detalles.getTokenValidacion());
            solicitudActualizada.setFechaFirma(detalles.getFechaFirma());
            solicitudActualizada.setComentarioCierre(detalles.getComentarioCierre());
            solicitudActualizada.setActivo(detalles.getActivo());
            
            // Actualizamos las llaves foráneas
            solicitudActualizada.setEstadoSolicitud(detalles.getEstadoSolicitud());
            solicitudActualizada.setSubCategoria(detalles.getSubCategoria());
            solicitudActualizada.setUsuario(detalles.getUsuario());
            solicitudActualizada.setObra(detalles.getObra());

            return solicitudRepository.save(solicitudActualizada);
        } else {
            return null;
        }
    }

    public boolean delete(Long id) {
        Optional<Solicitud> solicitudExistente = solicitudRepository.findById(id);

        if (solicitudExistente.isPresent()) {
            Solicitud solicitud = solicitudExistente.get();
            // Cambiamos el estado a inactivo en lugar de borrar el registro de la BD
            solicitud.setActivo(false);
            solicitudRepository.save(solicitud);
            return true;
        }
        return false;
    }
}