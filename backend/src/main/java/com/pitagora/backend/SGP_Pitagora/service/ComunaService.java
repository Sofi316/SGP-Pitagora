package com.pitagora.backend.SGP_Pitagora.service;


import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.pitagora.backend.SGP_Pitagora.model.Comuna;
import com.pitagora.backend.SGP_Pitagora.repository.ComunaRepository;

@Service
public class ComunaService {
    private final ComunaRepository comunaRepository;
    public ComunaService(ComunaRepository comunaRepository){
        this.comunaRepository= comunaRepository;
    }
    public List<Comuna> findAll(){
        return comunaRepository.findAll();
    }
    public List<Comuna> listarPorRegion(Long id){
        return comunaRepository.findByRegionId(id);
    }
    public Optional<Comuna> findById(Long id){
        return comunaRepository.findById(id);
    }
    public Comuna save(Comuna comuna){
        return comunaRepository.save(comuna);
    }

    public Comuna update(Long id, Comuna comunaModificada) {
        Optional<Comuna> comunaExistente = comunaRepository.findById(id);

        if (comunaExistente.isPresent()) {
            Comuna comunaAEditar = comunaExistente.get();
            comunaAEditar.setNombre(comunaModificada.getNombre());
            comunaAEditar.setRegion(comunaModificada.getRegion());
            
            return comunaRepository.save(comunaAEditar);
        } else {
            return null;
        }
    }

}
