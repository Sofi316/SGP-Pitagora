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

import com.pitagora.backend.SGP_Pitagora.model.ArchivoEvidencia;
import com.pitagora.backend.SGP_Pitagora.service.ArchivoEvidenciaService;

@RestController
@RequestMapping("/api/archivos-evidencia")
@CrossOrigin(origins = "*")
public class ArchivoEvidenciaController {

    @Autowired
    private ArchivoEvidenciaService archivoEvidenciaService;

    @GetMapping
    public ResponseEntity<List<ArchivoEvidencia>> listarTodos() {
        return new ResponseEntity<>(archivoEvidenciaService.obtenerTodos(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArchivoEvidencia> obtenerPorId(@PathVariable Long id) {
        Optional<ArchivoEvidencia> archivo = archivoEvidenciaService.obtenerPorId(id);
        return archivo.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Endpoint extra para traer fotos/evidencias de una solicitud en específico
    @GetMapping("/solicitud/{idSolicitud}")
    public ResponseEntity<List<ArchivoEvidencia>> obtenerPorSolicitud(@PathVariable Long idSolicitud) {
        List<ArchivoEvidencia> archivos = archivoEvidenciaService.obtenerPorSolicitud(idSolicitud);
        return new ResponseEntity<>(archivos, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ArchivoEvidencia> crear(@RequestBody ArchivoEvidencia archivoEvidencia) {
        ArchivoEvidencia nuevoArchivo = archivoEvidenciaService.guardar(archivoEvidencia);
        return new ResponseEntity<>(nuevoArchivo, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArchivoEvidencia> actualizar(@PathVariable Long id, @RequestBody ArchivoEvidencia detalles) {
        Optional<ArchivoEvidencia> archivoExistente = archivoEvidenciaService.obtenerPorId(id);

        if (archivoExistente.isPresent()) {
            ArchivoEvidencia archivoActualizado = archivoExistente.get();
            archivoActualizado.setRutaArchivo(detalles.getRutaArchivo());
            archivoActualizado.setTipoEvidencia(detalles.getTipoEvidencia());
            archivoActualizado.setSolicitud(detalles.getSolicitud());
            
            return new ResponseEntity<>(archivoEvidenciaService.guardar(archivoActualizado), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<ArchivoEvidencia> archivoExistente = archivoEvidenciaService.obtenerPorId(id);
        if (archivoExistente.isPresent()) {
            archivoEvidenciaService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}