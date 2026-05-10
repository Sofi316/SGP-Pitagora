package com.pitagora.backend.SGP_Pitagora.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pitagora.backend.SGP_Pitagora.model.ArchivoEvidencia;
import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.service.ArchivoEvidenciaService;

@RestController
@RequestMapping("/api/archivos-evidencia")
public class ArchivoEvidenciaController {

    private final ArchivoEvidenciaService archivoEvidenciaService;

    public ArchivoEvidenciaController (ArchivoEvidenciaService archivoEvidenciaService){
        this.archivoEvidenciaService = archivoEvidenciaService;
    }

    @GetMapping
    public ResponseEntity<List<ArchivoEvidencia>> listarTodos() {
        return ResponseEntity.ok(archivoEvidenciaService.obtenerTodos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id, @AuthenticationPrincipal Usuario principal) {
        ArchivoEvidencia archivo = archivoEvidenciaService.obtenerPorId(id);
        
        if (principal.getRol().getNombre().equals("CLIENTE")) {
            if (archivo.getSolicitud() == null || archivo.getSolicitud().getObra() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes acceso a las evidencias de esta solicitud.");
            }
            
            boolean tieneAcceso = principal.getObras().stream()
                    .anyMatch(obra -> obra.getId().equals(archivo.getSolicitud().getObra().getId()));
                    
            if (!tieneAcceso) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes acceso a las evidencias de esta solicitud.");
            }
        }
        return ResponseEntity.ok(archivo);
    }

    @GetMapping("/solicitud/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')")
    public ResponseEntity<?> obtenerPorSolicitud(@PathVariable Long id, @AuthenticationPrincipal Usuario principal) {
        List<ArchivoEvidencia> evidencias = archivoEvidenciaService.obtenerPorSolicitud(id);

        if (principal.getRol().getNombre().equals("CLIENTE")) {
            if (!evidencias.isEmpty()) {
                Solicitud solicitud = evidencias.get(0).getSolicitud();
                
                if (solicitud.getObra() == null) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("La solicitud indicada no pertenece a tus obras.");
                }
                
                boolean tieneAcceso = principal.getObras().stream()
                        .anyMatch(obra -> obra.getId().equals(solicitud.getObra().getId()));
                        
                if (!tieneAcceso) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("La solicitud indicada no pertenece a tus obras.");
                }
            }
            return ResponseEntity.ok(evidencias);
        }
        
        return ResponseEntity.ok(evidencias);
    }

    @PostMapping
    public ResponseEntity<ArchivoEvidencia> crear(@RequestBody ArchivoEvidencia archivoEvidencia) {
        ArchivoEvidencia nuevoArchivo = archivoEvidenciaService.guardar(archivoEvidencia);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoArchivo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArchivoEvidencia> actualizar(@PathVariable Long id, @RequestBody ArchivoEvidencia detalles) {
        return ResponseEntity.ok(archivoEvidenciaService.update(id, detalles));
    }
}