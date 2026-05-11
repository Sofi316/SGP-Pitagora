package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.TipoEvidencia;
import com.pitagora.backend.SGP_Pitagora.repository.TipoEvidenciaRepository;

@Service
public class TipoEvidenciaService {

    // Se agrega 'final' por buenas prácticas de inyección de dependencias
    private final TipoEvidenciaRepository tipoEvidenciaRepository;

    public TipoEvidenciaService(TipoEvidenciaRepository tipoEvidenciaRepository) {
        this.tipoEvidenciaRepository = tipoEvidenciaRepository;
    }

    public List<TipoEvidencia> obtenerTodos() {
        return tipoEvidenciaRepository.findAll();
    }

    public TipoEvidencia obtenerPorId(Long id) {
        return tipoEvidenciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tipo de evidencia no encontrado"));
    }

    public TipoEvidencia guardar(TipoEvidencia tipoEvidencia) {
        return tipoEvidenciaRepository.save(tipoEvidencia);
    }

    public TipoEvidencia update(Long id, TipoEvidencia detalles) {
        TipoEvidencia tipoAEditar = tipoEvidenciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tipo de evidencia no encontrado"));
        
        tipoAEditar.setNombre(detalles.getNombre());
        
        return tipoEvidenciaRepository.save(tipoAEditar);
    }
}