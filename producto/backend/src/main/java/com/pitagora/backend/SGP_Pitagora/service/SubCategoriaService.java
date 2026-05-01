package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.SubCategoria;
import com.pitagora.backend.SGP_Pitagora.repository.SubCategoriaRepository;

@Service
public class SubCategoriaService {

    private final SubCategoriaRepository subCategoriaRepository;

    public SubCategoriaService(SubCategoriaRepository subCategoriaRepository) {
    this.subCategoriaRepository = subCategoriaRepository;
    }

    public List<SubCategoria> findAll() {
        return subCategoriaRepository.findAll();
    }

    public List<SubCategoria> findAllActivas() {
        return subCategoriaRepository.findByActivoTrue();
    }

    public List<SubCategoria> listarPorCategoria(Long id) {
        return subCategoriaRepository.findByCategoriaIdAndActivoTrue(id);
    }

    public SubCategoria findById(Long id) {
    return subCategoriaRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subcategoría no encontrada"));
}

    public SubCategoria save(SubCategoria subCategoria){
        return subCategoriaRepository.save(subCategoria);
    }

    public SubCategoria update(Long id, SubCategoria subCategoriaModificada) {
        SubCategoria subCategoriaAEditar = subCategoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subcategoría no encontrada"));

        subCategoriaAEditar.setNombre(subCategoriaModificada.getNombre());
        subCategoriaAEditar.setCategoria(subCategoriaModificada.getCategoria());

        return subCategoriaRepository.save(subCategoriaAEditar);
    }
    
    public boolean delete(Long id) {
        SubCategoria subCategoria = subCategoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subcategoría no encontrada"));

        subCategoria.setActivo(false);
        subCategoriaRepository.save(subCategoria);
        return true;
    }
}
