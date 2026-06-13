package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.Categoria;
import com.pitagora.backend.SGP_Pitagora.model.SubCategoria;
import com.pitagora.backend.SGP_Pitagora.repository.CategoriaRepository;
import com.pitagora.backend.SGP_Pitagora.repository.SubCategoriaRepository;


@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final SubCategoriaRepository subCategoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, SubCategoriaRepository subCategoriaRepository) {
        this.categoriaRepository = categoriaRepository;
        this.subCategoriaRepository = subCategoriaRepository;
    }
    public List<Categoria> findAll() {
        return categoriaRepository.findAll();
    }

    public List<Categoria> findAllActivas() {
        return categoriaRepository.findByActivoTrue(); 
    }

    public Categoria findById(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));
    }

    public Categoria save(Categoria categoria){
        String nombreLimpio = categoria.getNombre().trim();
        Optional<Categoria> existente = categoriaRepository.findByNombreIgnoreCase(nombreLimpio);

        if (existente.isPresent()) {
            Categoria catBD = existente.get();
            if (catBD.getActivo()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe categoria con ese nombre");
            } else {
                catBD.setActivo(true);
                return categoriaRepository.save(catBD);
            }
        }

        categoria.setNombre(nombreLimpio);
        categoria.setActivo(true);
        return categoriaRepository.save(categoria);
    }
    
    public Categoria update(Long id, Categoria categoriaModificada) {
        Categoria categoriaAEditar = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));

        String nuevoNombre = categoriaModificada.getNombre().trim();

        Optional<Categoria> existente = categoriaRepository.findByNombreIgnoreCase(nuevoNombre);
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe categoria con ese nombre");
        }

        categoriaAEditar.setNombre(nuevoNombre);

        return categoriaRepository.save(categoriaAEditar);
    }

    @Transactional
    public void delete(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        categoria.setActivo(false);
        categoriaRepository.save(categoria);

        List<SubCategoria> subCategorias = subCategoriaRepository.findByCategoriaIdAndActivoTrue(id);
        
        for (SubCategoria subCategoria : subCategorias) {
            subCategoria.setActivo(false);
        }
        
        subCategoriaRepository.saveAll(subCategorias);
    }
}
