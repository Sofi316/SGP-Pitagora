package com.pitagora.backend.SGP_Pitagora.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.dto.CambioEstadoDto;
import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.service.ReporteService;
import com.pitagora.backend.SGP_Pitagora.service.SolicitudService;
import com.pitagora.backend.SGP_Pitagora.dto.ConformidadDto;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;
    private final ReporteService reporteService; 

    public SolicitudController(SolicitudService solicitudService, ReporteService reporteService) { // <-- Modificar el constructor
        this.solicitudService = solicitudService;
        this.reporteService = reporteService; 
    }

    @GetMapping 
    public ResponseEntity<List<Solicitud>> listarTodas() {
        return ResponseEntity.ok(solicitudService.obtenerTodas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id, @AuthenticationPrincipal Usuario principal) {
        Solicitud solicitud = solicitudService.obtenerPorId(id);
        
        if (principal.getRol().getNombre().equals("CLIENTE")) {
            if (solicitud.getObra() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("La solicitud consultada no tiene una obra válida asociada.");
            }
            
            boolean tieneAccesoAObra = principal.getObras().stream()
                    .anyMatch(obra -> obra.getId().equals(solicitud.getObra().getId()));
            
            if (!tieneAccesoAObra) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("No tienes acceso a las solicitudes de esta obra.");
            }
        }
        
        return ResponseEntity.ok(solicitud);
    }

    @GetMapping("/usuario/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLIENTE') and #id == authentication.principal.id)")
    public ResponseEntity<List<Solicitud>> obtenerPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudService.obtenerPorUsuario(id));
    }

    @GetMapping("/obra/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLIENTE') and authentication.principal.obras.![id].contains(#id))")
    public ResponseEntity<List<Solicitud>> obtenerPorObra(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudService.obtenerPorObra(id));
    }

    @GetMapping("/public/conformidad/{token}")
    public ResponseEntity<com.pitagora.backend.SGP_Pitagora.dto.SolicitudPublicoDto> obtenerPorTokenConformidad(@PathVariable String token) {
        return ResponseEntity.ok(solicitudService.obtenerPorTokenConformidad(token));
    }
    @PostMapping("/public/conformidad/{token}")
    public ResponseEntity<Solicitud> procesarConformidad(@PathVariable String token, @RequestBody ConformidadDto dto) {
        return ResponseEntity.ok(solicitudService.procesarConformidad(token, dto));
    }

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> crear(
            @RequestPart("solicitud") Solicitud solicitud,
            @RequestPart(value = "archivos", required = false) List<MultipartFile> archivos,
            @AuthenticationPrincipal Usuario principal) { 
        
        try {
            solicitud.setUsuario(principal); 
            Solicitud nuevaSolicitud = solicitudService.guardarConEvidencias(solicitud, archivos);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaSolicitud);
        } catch (ResponseStatusException e) {
            // Aquí forzamos la estructura JSON {"message": "El texto del error"} que lee React
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason()));
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<Solicitud> actualizar(@PathVariable Long id, @RequestBody Solicitud detalles) {
        return ResponseEntity.ok(solicitudService.update(id, detalles));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        solicitudService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/calificar")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<?> calificar(@PathVariable Long id, @RequestBody Map<String, Integer> body, @AuthenticationPrincipal Usuario principal) {
        Integer estrellas = body.get("estrellas");
        Solicitud solicitud = solicitudService.obtenerPorId(id);
        
        if (solicitud.getObra() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("La solicitud no tiene una obra válida asociada.");
        }
        
        boolean tieneAccesoAObra = principal.getObras().stream()
                .anyMatch(obra -> obra.getId().equals(solicitud.getObra().getId()));
        
        if (!tieneAccesoAObra) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Solo los usuarios asignados a esta obra pueden calificar la solicitud.");
        }
        
        Solicitud solicitudCalificada = solicitudService.registrarCalificacion(id, estrellas);
        return ResponseEntity.ok(solicitudCalificada);
    }
    
    @PostMapping(value = "/{id}/evidencia-reparacion", consumes = { "multipart/form-data" })
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')") 
    public ResponseEntity<String> subirEvidenciaReparacion(
            @PathVariable Long id,
            @RequestPart("archivos") List<MultipartFile> archivos) {
        
        solicitudService.agregarEvidenciaReparacion(id, archivos);
        
        return ResponseEntity.ok("Evidencia de reparación guardada exitosamente.");
    }

    @PatchMapping("/{id}/estado/{nuevoEstadoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @PathVariable Long nuevoEstadoId,
            @RequestBody(required = false) CambioEstadoDto dto) {
        
        String comentarioParaCorreo = (dto != null) ? dto.getComentario() : "";
        Solicitud solicitudActualizada = solicitudService.cambiarEstado(id, nuevoEstadoId, comentarioParaCorreo);
        return ResponseEntity.ok(solicitudActualizada);
    }

    @PutMapping("/{id}/costos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Solicitud> registrarCostoTotal(
            @PathVariable Long id, 
            @RequestBody Map<String, Long> body) {
        
        Long monto = body.get("monto");
        Solicitud solicitudActualizada = solicitudService.registrarCostoTotal(id, monto);
        return ResponseEntity.ok(solicitudActualizada);
    }

    @PostMapping("/exportar/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')")
    public ResponseEntity<byte[]> exportarExcel(@RequestBody List<Long> idsSolicitudes) {
        try {
            List<Solicitud> todasLasSolicitudes = solicitudService.obtenerTodas();
            List<Solicitud> solicitudesFiltradas = todasLasSolicitudes.stream()
                    .filter(s -> idsSolicitudes.contains(s.getId()))
                    .toList();

            if (solicitudesFiltradas.isEmpty()) {
                 return ResponseEntity.badRequest().body(null);
            }

            byte[] excelBytes = reporteService.exportarSolicitudesAExcel(solicitudesFiltradas);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "reporte_observaciones.xlsx");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    @PostMapping("/exportar/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')")
    public ResponseEntity<byte[]> exportarPdf(@RequestBody List<Long> idsSolicitudes) {
        try {
            List<Solicitud> todasLasSolicitudes = solicitudService.obtenerTodas();
            List<Solicitud> solicitudesFiltradas = todasLasSolicitudes.stream()
                    .filter(s -> idsSolicitudes.contains(s.getId()))
                    .toList();

            if (solicitudesFiltradas.isEmpty()) {
                 return ResponseEntity.badRequest().body(null);
            }

            byte[] pdfBytes = reporteService.exportarSolicitudesAPdf(solicitudesFiltradas);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/pdf"));
            headers.setContentDispositionFormData("attachment", "reporte_observaciones.pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}