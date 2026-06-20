package com.pitagora.backend.SGP_Pitagora.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.dto.ConformidadDto;
import com.pitagora.backend.SGP_Pitagora.dto.SolicitudPublicoDto;
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

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

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
        
        // 1. VALIDACIÓN: Verificar si la obra tiene usuarios asociados antes de hacer cualquier cosa
        if (solicitud.getObra() == null || solicitud.getObra().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe seleccionar una obra válida.");
        }

        List<String> correosDestino = usuarioRepository.findCorreosByObraId(solicitud.getObra().getId());
        if (correosDestino == null || correosDestino.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "No se puede crear la solicitud: La obra seleccionada no tiene usuarios asignados para recibir notificaciones.");
        }

        // 2. Si hay a quien notificar, guardamos la solicitud
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

        if (idNuevoEstado.equals(3L)) {
            solicitud.setTokenConformidad(UUID.randomUUID().toString());
            solicitud.setFechaExpiracionToken(LocalDateTime.now().plusWeeks(4));
            solicitud.setContadorRecordatorios(0);
            solicitud.setFechaUltimoRecordatorio(LocalDateTime.now());

            solicitud.setComentarioCierre(comentario);
        }

        solicitud.setEstadoSolicitud(nuevoEstado);
        Solicitud solicitudActualizada = solicitudRepository.save(solicitud);

        if (idNuevoEstado.equals(3L)) {
            notificarConformidadCliente(solicitudActualizada, comentario);
        } else {
            notificarUsuarios(solicitudActualizada, "El estado de su solicitud ha cambiado a: " + nuevoEstado.getNombre(), comentario);
        }

        return solicitudActualizada;
    }

    private void notificarConformidadCliente(Solicitud solicitud, String comentario) {
        if (solicitud.getObra() == null || solicitud.getObra().getId() == null) return;

        List<String> correosDestino = usuarioRepository.findCorreosByObraId(solicitud.getObra().getId());
        if (correosDestino == null || correosDestino.isEmpty()) return;

        String nombreObra = obraRepository.findById(solicitud.getObra().getId())
                .map(o -> o.getNombre())
                .orElse("Obra Desconocida");

        String asunto = "Conformidad Requerida SGP Pitagora [ID-" + solicitud.getId() + "] - Obra: " + nombreObra;
        String enlaceConformidad = frontendUrl + "/conformidad/" + solicitud.getTokenConformidad();

        StringBuilder cuerpoBuilder = new StringBuilder();
        cuerpoBuilder.append("Estimado cliente,\n\n");
        cuerpoBuilder.append("El trabajo asociado a su solicitud ha sido finalizado. Para completar el proceso de postventa, requerimos que revise los detalles y registre su conformidad.\n\n");
        
        if (comentario != null && !comentario.trim().isEmpty()) {
            cuerpoBuilder.append("Comentarios del equipo técnico:\n");
            cuerpoBuilder.append("\"").append(comentario.trim()).append("\"\n\n");
        }

        cuerpoBuilder.append("Por favor, ingrese al siguiente enlace seguro para revisar el reporte de reparación y emitir su aprobación o rechazo del trabajo:\n\n");
        cuerpoBuilder.append(enlaceConformidad).append("\n\n");
        cuerpoBuilder.append("Atención: Este enlace es exclusivo para la gestión de esta solicitud y solo permite una respuesta única. Una vez enviado, el enlace dejará de estar activo.\n\n");
        cuerpoBuilder.append("Este enlace no requiere inicio de sesión y estará activo por un plazo de 4 semanas.\n\n");
        cuerpoBuilder.append("Atentamente,\nEquipo de Postventa - Constructora Pitagora");

        for (String correo : correosDestino) {
            emailSenderService.enviarYArchivarCorreo(correo, asunto, cuerpoBuilder.toString(), solicitud);
        }
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

        String asunto = "Actualización SGP Pitagora [ID-" + solicitud.getId() + "] - Obra: " + nombreObra;

        StringBuilder cuerpoBuilder = new StringBuilder();
        cuerpoBuilder.append(mensajeBase).append("\n\n");

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
                     .append("Puede acceder al sistema para ver más detalles en el siguiente enlace:\n")
                     .append(frontendUrl).append("\n\n")
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

    public SolicitudPublicoDto obtenerPorTokenConformidad(String token) {
        Solicitud solicitud = solicitudRepository.findByTokenConformidad(token)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El enlace es inválido o no existe."));

        if (solicitud.getFechaExpiracionToken() != null && solicitud.getFechaExpiracionToken().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este enlace ya ha expirado.");
        }

        List<ArchivoEvidencia> evidencias = archivoEvidenciaRepository.findBySolicitudId(solicitud.getId());

        String catNombre = solicitud.getSubCategoria() != null && solicitud.getSubCategoria().getCategoria() != null ? solicitud.getSubCategoria().getCategoria().getNombre() : "N/A";
        String subNombre = solicitud.getSubCategoria() != null ? solicitud.getSubCategoria().getNombre() : "N/A";
        String obNombre = solicitud.getObra() != null ? solicitud.getObra().getNombre() : "N/A";

        return new SolicitudPublicoDto(
            solicitud.getId(),
            solicitud.getFechaIngreso(),
            solicitud.getDescripcion(),
            solicitud.getUbicacionExacta(),
            catNombre,
            subNombre,
            obNombre,
            solicitud.getComentarioCierre(),
            evidencias
        );
    }
    
    @Transactional
    public Solicitud procesarConformidad(String token, ConformidadDto dto) {
        Solicitud solicitud = solicitudRepository.findByTokenConformidad(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El enlace es inválido o no existe."));

        if (solicitud.getFechaExpiracionToken() != null && solicitud.getFechaExpiracionToken().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este enlace ya ha expirado.");
        }

        String estadoFinalStr;
        String detalleCuerpo;

        if (Boolean.TRUE.equals(dto.getConforme())) {
            EstadoSolicitud estadoAprobado = estadoSolicitudRepository.findById(4L)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estado APROBADO no encontrado"));
            solicitud.setEstadoSolicitud(estadoAprobado);
            estadoFinalStr = "APROBADO";
            detalleCuerpo = "El cliente ha aprobado el trabajo realizado.\n";
        } else {
            if (dto.getMotivoRechazo() == null || dto.getMotivoRechazo().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe indicar el motivo del rechazo.");
            }
            EstadoSolicitud estadoRechazado = estadoSolicitudRepository.findById(5L)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estado RECHAZADO no encontrado"));
            solicitud.setEstadoSolicitud(estadoRechazado);
            solicitud.setMotivoRechazo(dto.getMotivoRechazo());
            estadoFinalStr = "RECHAZADO";
            detalleCuerpo = "El cliente ha rechazado el trabajo.\nMotivo: " + dto.getMotivoRechazo() + "\n";
        }

        if (dto.getCalificacion() != null && dto.getCalificacion() >= 1 && dto.getCalificacion() <= 5) {
            solicitud.setCalificacion(dto.getCalificacion());
            detalleCuerpo += "\nCalificación del servicio: " + dto.getCalificacion() + " estrellas.\n";
        }

        // Enviar y archivar correo a los administradores de la obra ---
        if (solicitud.getObra() != null && solicitud.getObra().getId() != null) {
            List<String> correosAdmin = usuarioRepository.findCorreosByObraId(solicitud.getObra().getId());
            if (correosAdmin != null && !correosAdmin.isEmpty()) {
                String nombreObra = solicitud.getObra().getNombre();
                String asuntoAdmin = "Conformidad Registrada (" + estadoFinalStr + ") SGP Pitagora [ID-" + solicitud.getId() + "] - Obra: " + nombreObra;
                
                StringBuilder cuerpoBuilder = new StringBuilder();
                cuerpoBuilder.append("Estimados,\n\n");
                cuerpoBuilder.append("El cliente ha respondido a la solicitud de conformidad para el trabajo realizado.\n\n");
                cuerpoBuilder.append("--- Resultado de la Evaluación ---\n");
                cuerpoBuilder.append(detalleCuerpo).append("\n");
                cuerpoBuilder.append("----------------------------------\n\n");
                cuerpoBuilder.append("Puede acceder al sistema para ver los detalles completos.\n");

                for (String correo : correosAdmin) {
                    
                    emailSenderService.enviarYArchivarCorreo(correo, asuntoAdmin, cuerpoBuilder.toString(), solicitud);
                }
            }
        }
        solicitud.setFechaFirma(LocalDateTime.now());
        solicitud.setTokenConformidad(null);
        solicitud.setFechaExpiracionToken(null);
        solicitud.setContadorRecordatorios(0);

        return solicitudRepository.save(solicitud);
    }


}
