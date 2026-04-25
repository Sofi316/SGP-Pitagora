package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

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

    public Optional<Categoria> findById(Long id) {
        return categoriaRepository.findById(id);
    }

    public Categoria save(Categoria categoria){
        return categoriaRepository.save(categoria);
    }
    
    public Categoria update(Long id, Categoria categoriaModificada){
        // Optional envuelve el resultado en una caja, si la categoria no existe, no devuelve null, 
        //devuelve una caja vacía
        Optional<Categoria> categoriaExistente = categoriaRepository.findById(id);

        //este if le pregunta a la caja si tiene algo adentro
        if (categoriaExistente.isPresent()){
            //utilizamos get para sacar el objeto de la caja para trabajar con él
            Categoria categoriaAEditar = categoriaExistente.get();

            //tomamos la categoria original y solo sobreescribimos el nombre
            categoriaAEditar.setNombre(categoriaModificada.getNombre());

            //devolvemos la categoria modificada a spring para que haga el update en postgre
            return categoriaRepository.save(categoriaAEditar);

        }else{
            //si no existe la id se devuelve un null seguro, donde responseEntity responde
            return null;
        }
    }

    public boolean delete(Long id) {
        Optional<Categoria> categoriaExistente = categoriaRepository.findById(id);

        if (categoriaExistente.isPresent()) {
            Categoria categoria = categoriaExistente.get();
            categoria.setActivo(false);
            categoriaRepository.save(categoria);
            return true;
        }
        return false;
    } 
}
