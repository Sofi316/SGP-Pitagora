package com.pitagora.backend.SGP_Pitagora.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.service.SolicitudService;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "*")
public class SolicitudController {

    private final SolicitudService solicitudService;

    // Inyección por constructor
    public SolicitudController (SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @GetMapping 
    public ResponseEntity<List<Solicitud>> listarTodas() {
        return ResponseEntity.ok(solicitudService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Solicitud> obtenerPorId(@PathVariable Long id) {
        return solicitudService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Endpoint para obtener todas las solicitudes hechas por un usuario específico
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Solicitud>> obtenerPorUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(solicitudService.obtenerPorUsuario(idUsuario));
    }

    // Endpoint para obtener todas las solicitudes de una obra/proyecto específico
    @GetMapping("/obra/{idObra}")
    public ResponseEntity<List<Solicitud>> obtenerPorObra(@PathVariable Long idObra) {
        return ResponseEntity.ok(solicitudService.obtenerPorObra(idObra));
    }

    @PostMapping
    public ResponseEntity<Solicitud> crear(@RequestBody Solicitud solicitud) {
        Solicitud nuevaSolicitud = solicitudService.guardar(solicitud);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaSolicitud);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Solicitud> actualizar(@PathVariable Long id, @RequestBody Solicitud detalles) {
        // Delegamos la lógica de actualización al servicio
        Solicitud actualizada = solicitudService.update(id, detalles);
        
        if (actualizada != null) {
            return ResponseEntity.ok(actualizada);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        // Delegamos el borrado lógico al servicio
        boolean eliminado = solicitudService.delete(id);
        
        if (eliminado) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/calificar")
    public ResponseEntity<Solicitud> calificar(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer estrellas = body.get("estrellas");
        return ResponseEntity.ok(solicitudService.registrarCalificacion(id, estrellas));
    }   
}