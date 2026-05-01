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

import com.pitagora.backend.SGP_Pitagora.model.TipoEvidencia;
import com.pitagora.backend.SGP_Pitagora.service.TipoEvidenciaService;

@RestController
@RequestMapping("/api/tipos-evidencia")
@CrossOrigin(origins = "*")
public class TipoEvidenciaController {

    private final TipoEvidenciaService tipoEvidenciaService;

    // Inyección por constructor
    public TipoEvidenciaController (TipoEvidenciaService tipoEvidenciaService){
        this.tipoEvidenciaService = tipoEvidenciaService;
    }

    // GET: /api/tipos-evidencia
    @GetMapping
    public ResponseEntity<List<TipoEvidencia>> listarTodos() {
        return ResponseEntity.ok(tipoEvidenciaService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoEvidencia> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(tipoEvidenciaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<TipoEvidencia> crear(@RequestBody TipoEvidencia tipoEvidencia) {
        TipoEvidencia nuevoTipo = tipoEvidenciaService.guardar(tipoEvidencia);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoTipo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoEvidencia> actualizar(@PathVariable Long id, @RequestBody TipoEvidencia detalles) {
        return ResponseEntity.ok(tipoEvidenciaService.update(id, detalles));
    }
}