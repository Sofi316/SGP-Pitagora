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

import com.pitagora.backend.SGP_Pitagora.model.TipoEvidencia;
import com.pitagora.backend.SGP_Pitagora.service.TipoEvidenciaService;

@RestController
@RequestMapping("/api/tipos-evidencia")
@CrossOrigin(origins = "*") // Permite peticiones desde el frontend (podemos configurarlo mejor más adelante)
public class TipoEvidenciaController {

    @Autowired
    private TipoEvidenciaService tipoEvidenciaService;

    // GET: /api/tipos-evidencia
    @GetMapping
    public ResponseEntity<List<TipoEvidencia>> listarTodos() {
        List<TipoEvidencia> lista = tipoEvidenciaService.obtenerTodos();
        return new ResponseEntity<>(lista, HttpStatus.OK);
    }

    // GET: /api/tipos-evidencia/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TipoEvidencia> obtenerPorId(@PathVariable Long id) {
        Optional<TipoEvidencia> tipoEvidencia = tipoEvidenciaService.obtenerPorId(id);
        return tipoEvidencia.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // POST: /api/tipos-evidencia
    @PostMapping
    public ResponseEntity<TipoEvidencia> crear(@RequestBody TipoEvidencia tipoEvidencia) {
        TipoEvidencia nuevoTipo = tipoEvidenciaService.guardar(tipoEvidencia);
        return new ResponseEntity<>(nuevoTipo, HttpStatus.CREATED);
    }

    // PUT: /api/tipos-evidencia/{id}
    @PutMapping("/{id}")
    public ResponseEntity<TipoEvidencia> actualizar(@PathVariable Long id, @RequestBody TipoEvidencia tipoEvidenciaDetalles) {
        Optional<TipoEvidencia> tipoExistente = tipoEvidenciaService.obtenerPorId(id);
        
        if (tipoExistente.isPresent()) {
            TipoEvidencia tipoActualizado = tipoExistente.get();
            tipoActualizado.setNombre(tipoEvidenciaDetalles.getNombre());
            // El ID no se cambia
            return new ResponseEntity<>(tipoEvidenciaService.guardar(tipoActualizado), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // DELETE: /api/tipos-evidencia/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<TipoEvidencia> tipoExistente = tipoEvidenciaService.obtenerPorId(id);
        if (tipoExistente.isPresent()) {
            tipoEvidenciaService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}