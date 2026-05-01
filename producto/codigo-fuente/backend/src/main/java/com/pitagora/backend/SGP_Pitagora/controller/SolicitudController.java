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
        return ResponseEntity.ok(solicitudService.obtenerPorId(id));
    }

    @GetMapping("/usuario/{id}")
    public ResponseEntity<List<Solicitud>> obtenerPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudService.obtenerPorUsuario(id));
    }

    @GetMapping("/obra/{id}")
    public ResponseEntity<List<Solicitud>> obtenerPorObra(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudService.obtenerPorObra(id));
    }

    @PostMapping
    public ResponseEntity<Solicitud> crear(@RequestBody Solicitud solicitud) {
        Solicitud nuevaSolicitud = solicitudService.guardar(solicitud);
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
    public ResponseEntity<Solicitud> calificar(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer estrellas = body.get("estrellas");
        return ResponseEntity.ok(solicitudService.registrarCalificacion(id, estrellas));
    }
}