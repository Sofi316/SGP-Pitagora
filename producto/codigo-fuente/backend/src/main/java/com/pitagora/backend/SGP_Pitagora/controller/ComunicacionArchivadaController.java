package com.pitagora.backend.SGP_Pitagora.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pitagora.backend.SGP_Pitagora.model.ComunicacionArchivada;
import com.pitagora.backend.SGP_Pitagora.service.ComunicacionArchivadaService;

@RestController
@RequestMapping("/api/comunicaciones")
@CrossOrigin(origins = "*")
public class ComunicacionArchivadaController {

    private final ComunicacionArchivadaService comunicacionArchivadaService;

    public ComunicacionArchivadaController(ComunicacionArchivadaService comunicacionArchivadaService) {
        this.comunicacionArchivadaService = comunicacionArchivadaService;
    }

    @GetMapping
    public ResponseEntity<List<ComunicacionArchivada>> getAll() {
        return ResponseEntity.ok(comunicacionArchivadaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComunicacionArchivada> getById(@PathVariable Long id) {
        return ResponseEntity.ok(comunicacionArchivadaService.findById(id));
    }

    @GetMapping("/filtrar")
    public ResponseEntity<List<ComunicacionArchivada>> filtrar(
            @RequestParam Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String keyword
    ) {

        List<ComunicacionArchivada> comunicaciones =
                comunicacionArchivadaService.filtrarComunicaciones(
                        id,
                        fechaInicio,
                        fechaFin,
                        keyword
                );

        if (comunicaciones.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(comunicaciones);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ComunicacionArchivada comunicacion) {
        if (comunicacion.getSolicitud() == null || comunicacion.getSolicitud().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Debe asociar una solicitud válida.");
        }
        ComunicacionArchivada nuevaComunicacion = comunicacionArchivadaService.save(comunicacion);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaComunicacion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ComunicacionArchivada comunicacion) {
        if (comunicacion.getSolicitud() == null || comunicacion.getSolicitud().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("La comunicación debe mantener una solicitud válida.");
        }
        return ResponseEntity.ok(comunicacionArchivadaService.update(id, comunicacion));
    }
}

