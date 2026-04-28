package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

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

    public Optional<TipoEvidencia> obtenerPorId(Long id) {
        return tipoEvidenciaRepository.findById(id);
    }

    public TipoEvidencia guardar(TipoEvidencia tipoEvidencia) {
        return tipoEvidenciaRepository.save(tipoEvidencia);
    }

    public TipoEvidencia update(Long id, TipoEvidencia detalles) {
        Optional<TipoEvidencia> tipoExistente = tipoEvidenciaRepository.findById(id);

        if (tipoExistente.isPresent()) {
            TipoEvidencia tipoAEditar = tipoExistente.get();
            
            // Solo actualizamos el nombre, el ID se mantiene intacto
            tipoAEditar.setNombre(detalles.getNombre());
            
            return tipoEvidenciaRepository.save(tipoAEditar);
        } else {
            return null;
        }
    }
}