package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.ArchivoEvidencia;
import com.pitagora.backend.SGP_Pitagora.repository.ArchivoEvidenciaRepository;

@Service
public class ArchivoEvidenciaService {

    private final ArchivoEvidenciaRepository archivoEvidenciaRepository;

    public ArchivoEvidenciaService(ArchivoEvidenciaRepository archivoEvidenciaRepository) {
        this.archivoEvidenciaRepository = archivoEvidenciaRepository;
    }

    public List<ArchivoEvidencia> obtenerTodos() {
        return archivoEvidenciaRepository.findAll();
    }

    public ArchivoEvidencia obtenerPorId(Long id) {
        return archivoEvidenciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Archivo de evidencia no encontrado"));
    }

    public List<ArchivoEvidencia> obtenerPorSolicitud(Long id) {
        return archivoEvidenciaRepository.findBySolicitudId(id);
    }

    public ArchivoEvidencia guardar(ArchivoEvidencia archivoEvidencia) {
        return archivoEvidenciaRepository.save(archivoEvidencia);
    }

    public ArchivoEvidencia update(Long id, ArchivoEvidencia archivoModificado) {
        ArchivoEvidencia archivoAEditar = archivoEvidenciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Archivo de evidencia no encontrado"));

        archivoAEditar.setRutaArchivo(archivoModificado.getRutaArchivo());
        archivoAEditar.setTipoEvidencia(archivoModificado.getTipoEvidencia());
        archivoAEditar.setSolicitud(archivoModificado.getSolicitud());

        return archivoEvidenciaRepository.save(archivoAEditar);
    }
}