package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.ArchivoEvidencia;
import com.pitagora.backend.SGP_Pitagora.model.EstadoSolicitud;
import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.model.TipoEvidencia;
import com.pitagora.backend.SGP_Pitagora.repository.ArchivoEvidenciaRepository;
import com.pitagora.backend.SGP_Pitagora.repository.EstadoSolicitudRepository;
import com.pitagora.backend.SGP_Pitagora.repository.ObraRepository;
import com.pitagora.backend.SGP_Pitagora.repository.SolicitudRepository;
import com.pitagora.backend.SGP_Pitagora.repository.SubCategoriaRepository;
import com.pitagora.backend.SGP_Pitagora.repository.UsuarioRepository;

@Service
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final ArchivoEvidenciaRepository archivoEvidenciaRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final EmailSenderService emailSenderService;
    private final UsuarioRepository usuarioRepository;
    private final EstadoSolicitudRepository estadoSolicitudRepository;
    private final ObraRepository obraRepository;
    private final SubCategoriaRepository subCategoriaRepository;

    public SolicitudService(SolicitudRepository solicitudRepository, 
                            ArchivoEvidenciaRepository archivoEvidenciaRepository, 
                            SupabaseStorageService supabaseStorageService,
                            EmailSenderService emailSenderService,
                            UsuarioRepository usuarioRepository,
                            EstadoSolicitudRepository estadoSolicitudRepository, 
                            ObraRepository obraRepository, 
                            SubCategoriaRepository subCategoriaRepository) {
        this.solicitudRepository = solicitudRepository;
        this.archivoEvidenciaRepository = archivoEvidenciaRepository;
        this.supabaseStorageService = supabaseStorageService;
        this.emailSenderService = emailSenderService;
        this.usuarioRepository = usuarioRepository;
        this.estadoSolicitudRepository = estadoSolicitudRepository;
        this.obraRepository = obraRepository;
        this.subCategoriaRepository = subCategoriaRepository;
    }

    @Transactional
    public Solicitud guardarConEvidencias(Solicitud solicitud, List<MultipartFile> archivos) {
        Solicitud solicitudGuardada = solicitudRepository.save(solicitud);

        if (archivos != null && !archivos.isEmpty()) {
            for (MultipartFile file : archivos) {
                if (!file.isEmpty()) {
                    String urlPublica = supabaseStorageService.uploadEvidencia(file);

                    TipoEvidencia tipo = new TipoEvidencia();
                    tipo.setId(1L); 

                    ArchivoEvidencia evidencia = new ArchivoEvidencia();
                    evidencia.setRutaArchivo(urlPublica);
                    evidencia.setTipoEvidencia(tipo);
                    evidencia.setSolicitud(solicitudGuardada);

                    archivoEvidenciaRepository.save(evidencia);
                }
            }
        }

        // Al crear la solicitud, llamamos a notificar sin comentarios adicionales
        notificarUsuarios(solicitudGuardada, "Se ha creado una nueva solicitud de hallazgo en su obra.", "");

        return solicitudGuardada;
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

    @Transactional
    public Solicitud cambiarEstado(Long idSolicitud, Long idNuevoEstado, String comentario) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));

        EstadoSolicitud nuevoEstado = estadoSolicitudRepository.findById(idNuevoEstado)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estado no válido"));

        Long idEstadoActual = solicitud.getEstadoSolicitud().getId();

        boolean cambioValido = false;
        
        if (idEstadoActual.equals(1L) && (idNuevoEstado.equals(2L) || idNuevoEstado.equals(6L))) {
            cambioValido = true;
        } 
        else if (idEstadoActual.equals(2L) && idNuevoEstado.equals(3L)) {
            cambioValido = true;
        } 
        else if (idEstadoActual.equals(idNuevoEstado)) {
            return solicitud; 
        }
        
        if (!cambioValido) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transición de estado no permitida.");
        }

        solicitud.setEstadoSolicitud(nuevoEstado);
        Solicitud solicitudActualizada = solicitudRepository.save(solicitud);

        // Activado: Despacha las notificaciones incluyendo el comentario temporal en el correo
        notificarUsuarios(
            solicitudActualizada, 
            "El estado de su solicitud ha cambiado a: " + nuevoEstado.getNombre(), 
            comentario
        );

        return solicitudActualizada;
    }

    private void notificarUsuarios(Solicitud solicitud, String mensajeBase, String comentario) {
        if (solicitud.getObra() == null || solicitud.getObra().getId() == null) return;

        List<String> correosDestino = usuarioRepository.findCorreosByObraId(solicitud.getObra().getId());
        if (correosDestino == null || correosDestino.isEmpty()) return;

        String nombreObra = obraRepository.findById(solicitud.getObra().getId())
                .map(o -> o.getNombre())
                .orElse("Obra Desconocida");

        String categoriaNombre = "N/A";
        String subCategoriaNombre = "N/A";

        if (solicitud.getSubCategoria() != null && solicitud.getSubCategoria().getId() != null) {
            var scOpt = subCategoriaRepository.findById(solicitud.getSubCategoria().getId());
            if (scOpt.isPresent()) {
                var sc = scOpt.get();
                categoriaNombre = (sc.getCategoria() != null) ? sc.getCategoria().getNombre() : "N/A";
                subCategoriaNombre = sc.getNombre();
            }
        }

        // El asunto preserva el tag [ID-xxx] idéntico para que EmailPollerService lo reconozca
        String asunto = "Actualización SGP Pitagora [ID-" + solicitud.getId() + "] - Obra: " + nombreObra;

        StringBuilder cuerpoBuilder = new StringBuilder();
        cuerpoBuilder.append(mensajeBase).append("\n\n");

        // Si el usuario ingresó una observación en la caja de texto, la incrustamos aquí
        if (comentario != null && !comentario.trim().isEmpty()) {
            cuerpoBuilder.append("Observaciones adicionales del administrador:\n");
            cuerpoBuilder.append("\"").append(comentario.trim()).append("\"\n\n");
        }

        cuerpoBuilder.append("--- Detalles de la Solicitud ---\n")
                     .append("ID: ").append(solicitud.getId()).append("\n")
                     .append("Categoría: ").append(categoriaNombre).append(" - ").append(subCategoriaNombre).append("\n")
                     .append("Ubicación: ").append(solicitud.getUbicacionExacta() != null ? solicitud.getUbicacionExacta() : "No especificada").append("\n")
                     .append("Descripción: ").append(solicitud.getDescripcion() != null ? solicitud.getDescripcion() : "Sin descripción").append("\n\n")
                     .append("--------------------------------\n\n")
                     .append("Por favor, si desea agregar algún comentario, responda a este correo manteniendo el asunto intacto.");

        for (String correo : correosDestino) {
            emailSenderService.enviarYArchivarCorreo(correo, asunto, cuerpoBuilder.toString(), solicitud);
        }
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
    public Solicitud registrarCostoTotal(Long id, Long monto) {
        Solicitud solicitud = obtenerPorId(id);
        solicitud.setCostoReparacion(monto != null ? monto : 0L);
        return solicitudRepository.save(solicitud);
    }
}