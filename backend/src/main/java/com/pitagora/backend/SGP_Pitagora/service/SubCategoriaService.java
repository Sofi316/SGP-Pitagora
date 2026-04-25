package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

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

    public Optional<SubCategoria> findById(Long id) {
        return subCategoriaRepository.findById(id);
    }

    public SubCategoria save(SubCategoria subCategoria){
        return subCategoriaRepository.save(subCategoria);
    }

    public SubCategoria update(Long id, SubCategoria subCategoriaModificada) {
        Optional<SubCategoria> subCategoriaExistente = subCategoriaRepository.findById(id);

        if (subCategoriaExistente.isPresent()) {
            SubCategoria subCategoriaAEditar = subCategoriaExistente.get();
            subCategoriaAEditar.setNombre(subCategoriaModificada.getNombre());
            subCategoriaAEditar.setCategoria(subCategoriaModificada.getCategoria());
            
            return subCategoriaRepository.save(subCategoriaAEditar);
        } else {
            return null;
        }
    }
    
    public boolean delete(Long id) {
        Optional<SubCategoria> subCategoriaExistente = subCategoriaRepository.findById(id);

        if (subCategoriaExistente.isPresent()) {
            SubCategoria subCategoria = subCategoriaExistente.get();
            subCategoria.setActivo(false);
            subCategoriaRepository.save(subCategoria);
            return true;
        }
        return false;
    }
}
