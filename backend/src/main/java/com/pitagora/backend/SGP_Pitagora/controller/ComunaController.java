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

import com.pitagora.backend.SGP_Pitagora.model.Comuna;
import com.pitagora.backend.SGP_Pitagora.service.ComunaService;



@RestController
@RequestMapping("/api/comunas")
@CrossOrigin(origins = "*")
public class ComunaController {
    private final ComunaService comunaService;
    public ComunaController (ComunaService comunaService){
        this.comunaService = comunaService;
    }
    @GetMapping
    public ResponseEntity<List<Comuna>> getAll(){
        return ResponseEntity.ok(comunaService.findAll());
    }
    @GetMapping("/region/{id}")
    public ResponseEntity<List<Comuna>> getByRegion(@PathVariable Long id) {
        List<Comuna> comuna = comunaService.listarPorRegion(id);
        if (comuna.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(comuna);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Comuna comuna) {
        if (comuna.getRegion() == null || comuna.getRegion().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: La comuna debe estar vinculada a una región padre válida.");
        }

        Comuna nuevaComuna = comunaService.save(comuna);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaComuna);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Comuna comuna) {
        // Validación: Evitar que al editar le quiten el padre accidentalmente
        if (comuna.getRegion() == null || comuna.getRegion().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: La comuna debe mantener una región padre válida.");
        }

        Comuna comunaActualizada = comunaService.update(id, comuna);
        if (comunaActualizada == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(comunaActualizada);
    }

}
