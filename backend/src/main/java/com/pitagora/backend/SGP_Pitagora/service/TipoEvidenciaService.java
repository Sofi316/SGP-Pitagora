package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pitagora.backend.SGP_Pitagora.model.TipoEvidencia;
import com.pitagora.backend.SGP_Pitagora.repository.TipoEvidenciaRepository;

@Service
public class TipoEvidenciaService {

    @Autowired
    private TipoEvidenciaRepository tipoEvidenciaRepository;

    // Obtener todos los tipos de evidencia
    public List<TipoEvidencia> obtenerTodos() {
        return tipoEvidenciaRepository.findAll();
    }

    // Obtener un tipo de evidencia por ID
    public Optional<TipoEvidencia> obtenerPorId(Long id) {
        return tipoEvidenciaRepository.findById(id);
    }

    // Crear o actualizar un tipo de evidencia
    public TipoEvidencia guardar(TipoEvidencia tipoEvidencia) {
        return tipoEvidenciaRepository.save(tipoEvidencia);
    }

    // Eliminar un tipo de evidencia
    public void eliminar(Long id) {
        tipoEvidenciaRepository.deleteById(id);
    }
}