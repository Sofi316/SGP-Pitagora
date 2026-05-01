package com.pitagora.backend.SGP_Pitagora.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pitagora.backend.SGP_Pitagora.model.ArchivoEvidencia;
import com.pitagora.backend.SGP_Pitagora.service.ArchivoEvidenciaService;

@RestController
@RequestMapping("/api/archivos-evidencia")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<ArchivoEvidencia> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(archivoEvidenciaService.obtenerPorId(id));
    }

    @GetMapping("/solicitud/{id}")
    public ResponseEntity<List<ArchivoEvidencia>> obtenerPorSolicitud(@PathVariable Long id) {
        return ResponseEntity.ok(archivoEvidenciaService.obtenerPorSolicitud(id));
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