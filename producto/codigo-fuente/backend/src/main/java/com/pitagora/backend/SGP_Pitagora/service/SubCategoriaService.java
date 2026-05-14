package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;

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
        String nombreLimpio = subCategoria.getNombre().trim();
        Long idCategoriaPadre = subCategoria.getCategoria().getId();
        
        Optional<SubCategoria> existente = subCategoriaRepository.findByNombreIgnoreCaseAndCategoriaId(nombreLimpio, idCategoriaPadre);

        if (existente.isPresent()) {
            SubCategoria subcatBD = existente.get();
            if (subcatBD.getActivo()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe esta subcategoría dentro de la categoría seleccionada");
            } else {
                subcatBD.setActivo(true);
                return subCategoriaRepository.save(subcatBD);
            }
        }

        subCategoria.setNombre(nombreLimpio);
        subCategoria.setActivo(true);
        return subCategoriaRepository.save(subCategoria);
    }

    public SubCategoria update(Long id, SubCategoria subCategoriaModificada) {
        SubCategoria subCategoriaAEditar = subCategoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subcategoría no encontrada"));

        String nuevoNombre = subCategoriaModificada.getNombre().trim();
        Long nuevaCategoriaPadre = subCategoriaModificada.getCategoria().getId();

        Optional<SubCategoria> existente = subCategoriaRepository.findByNombreIgnoreCaseAndCategoriaId(nuevoNombre, nuevaCategoriaPadre);
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe esta subcategoría dentro de la categoría seleccionada");
        }

        subCategoriaAEditar.setNombre(nuevoNombre);
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