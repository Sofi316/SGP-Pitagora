package com.pitagora.backend.SGP_Pitagora.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
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

import com.pitagora.backend.SGP_Pitagora.dto.CambioEstadoDto;
import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.service.SolicitudService;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
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

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<Solicitud> crear(
            @RequestPart("solicitud") Solicitud solicitud,
            @RequestPart(value = "archivos", required = false) List<MultipartFile> archivos,
            @AuthenticationPrincipal Usuario principal) { 
        
        solicitud.setUsuario(principal); 

        Solicitud nuevaSolicitud = solicitudService.guardarConEvidencias(solicitud, archivos);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaSolicitud);
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
}

