package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.Categoria;
import com.pitagora.backend.SGP_Pitagora.repository.CategoriaRepository;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
    this.categoriaRepository = categoriaRepository;
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
        return categoriaRepository.save(categoria);
    }
    
    public Categoria update(Long id, Categoria categoriaModificada) {
        Categoria categoriaAEditar = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));

        categoriaAEditar.setNombre(categoriaModificada.getNombre());

        return categoriaRepository.save(categoriaAEditar);
    }

    public boolean delete(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));
        
        categoria.setActivo(false);
        categoriaRepository.save(categoria);
        return true;
    }
}
