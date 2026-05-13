package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.ArchivoEvidencia;
import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.model.TipoEvidencia;
import com.pitagora.backend.SGP_Pitagora.repository.ArchivoEvidenciaRepository;
import com.pitagora.backend.SGP_Pitagora.repository.SolicitudRepository;

@Service
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final ArchivoEvidenciaRepository archivoEvidenciaRepository;
    private final SupabaseStorageService supabaseStorageService;

    public SolicitudService(SolicitudRepository solicitudRepository, ArchivoEvidenciaRepository archivoEvidenciaRepository, SupabaseStorageService supabaseStorageService) {
        this.solicitudRepository = solicitudRepository;
        this.archivoEvidenciaRepository = archivoEvidenciaRepository;
        this.supabaseStorageService = supabaseStorageService;
    }

    public List<Solicitud> obtenerTodas() {
        return solicitudRepository.findAllConDetalles();
    }

    public Solicitud obtenerPorId(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));
    }

    public List<Solicitud> obtenerPorUsuario(Long id) {
        return solicitudRepository.findByUsuarioIdConDetalles(id);
    }

    public List<Solicitud> obtenerPorObra(Long id) {
        return solicitudRepository.findByObraIdConDetalles(id);
    }

    @Transactional
    public Solicitud guardarConEvidencias(Solicitud solicitud, List<MultipartFile> archivos) {
        Solicitud solicitudGuardada = solicitudRepository.save(solicitud);

        if (archivos != null && !archivos.isEmpty()) {
            for (MultipartFile file : archivos) {
                if (!file.isEmpty()) {
                    String urlPublica = supabaseStorageService.uploadEvidencia(file);

                    Long idTipo = (file.getContentType() != null && file.getContentType().contains("pdf")) ? 2L : 1L;
                    TipoEvidencia tipo = new TipoEvidencia();
                    tipo.setId(idTipo);

                    ArchivoEvidencia evidencia = new ArchivoEvidencia();
                    evidencia.setRutaArchivo(urlPublica);
                    evidencia.setTipoEvidencia(tipo);
                    evidencia.setSolicitud(solicitudGuardada);

                    archivoEvidenciaRepository.save(evidencia);
                }
            }
        }

        return solicitudGuardada;
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

    @Transactional
    public void agregarEvidenciaReparacion(Long solicitudId, List<MultipartFile> archivos) {
        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));

        if (archivos != null && !archivos.isEmpty()) {
            for (MultipartFile file : archivos) {
                if (!file.isEmpty()) {
                    String urlPublica = supabaseStorageService.uploadEvidencia(file);

                    TipoEvidencia tipo = new TipoEvidencia();
                    tipo.setId(2L); 

                    ArchivoEvidencia evidencia = new ArchivoEvidencia();
                    evidencia.setRutaArchivo(urlPublica);
                    evidencia.setTipoEvidencia(tipo);
                    evidencia.setSolicitud(solicitud);

                    archivoEvidenciaRepository.save(evidencia);
                }
            }
        }
    }
}