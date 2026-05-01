package com.pitagora.backend.SGP_Pitagora.service;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
    public Comuna findById(Long id){
        return comunaRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comuna no encontrada"));
    }
    public Comuna save(Comuna comuna){
        return comunaRepository.save(comuna);
    }


}
