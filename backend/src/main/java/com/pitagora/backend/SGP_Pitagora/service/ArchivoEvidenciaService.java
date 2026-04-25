package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pitagora.backend.SGP_Pitagora.model.ArchivoEvidencia;
import com.pitagora.backend.SGP_Pitagora.repository.ArchivoEvidenciaRepository;

@Service
public class ArchivoEvidenciaService {

    @Autowired
    private ArchivoEvidenciaRepository archivoEvidenciaRepository;

    public List<ArchivoEvidencia> obtenerTodos() {
        return archivoEvidenciaRepository.findAll();
    }

    public Optional<ArchivoEvidencia> obtenerPorId(Long id) {
        return archivoEvidenciaRepository.findById(id);
    }

    // Nuevo método usando nuestra consulta personalizada
    public List<ArchivoEvidencia> obtenerPorSolicitud(Long idSolicitud) {
        return archivoEvidenciaRepository.findBySolicitudId(idSolicitud);
    }

    public ArchivoEvidencia guardar(ArchivoEvidencia archivoEvidencia) {
        return archivoEvidenciaRepository.save(archivoEvidencia);
    }

    public void eliminar(Long id) {
        archivoEvidenciaRepository.deleteById(id);
    }
}