package com.pitagora.backend.SGP_Pitagora.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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

    @Autowired
    private SolicitudService solicitudService;

    @GetMapping
    public ResponseEntity<List<Solicitud>> listarTodas() {
        return new ResponseEntity<>(solicitudService.obtenerTodas(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Solicitud> obtenerPorId(@PathVariable Long id) {
        Optional<Solicitud> solicitud = solicitudService.obtenerPorId(id);
        return solicitud.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Endpoint para obtener todas las solicitudes hechas por un usuario específico
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Solicitud>> obtenerPorUsuario(@PathVariable Long idUsuario) {
        return new ResponseEntity<>(solicitudService.obtenerPorUsuario(idUsuario), HttpStatus.OK);
    }

    // Endpoint para obtener todas las solicitudes de una obra/proyecto específico
    @GetMapping("/obra/{idObra}")
    public ResponseEntity<List<Solicitud>> obtenerPorObra(@PathVariable Long idObra) {
        return new ResponseEntity<>(solicitudService.obtenerPorObra(idObra), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Solicitud> crear(@RequestBody Solicitud solicitud) {
        Solicitud nuevaSolicitud = solicitudService.guardar(solicitud);
        return new ResponseEntity<>(nuevaSolicitud, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Solicitud> actualizar(@PathVariable Long id, @RequestBody Solicitud detalles) {
        Optional<Solicitud> solicitudExistente = solicitudService.obtenerPorId(id);

        if (solicitudExistente.isPresent()) {
            Solicitud solicitudActualizada = solicitudExistente.get();
            
            // Actualizamos los campos necesarios (fechaIngreso no se toca porque se maneja en @PrePersist)
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

            return new ResponseEntity<>(solicitudService.guardar(solicitudActualizada), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<Solicitud> solicitudExistente = solicitudService.obtenerPorId(id);
        if (solicitudExistente.isPresent()) {
            solicitudService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}