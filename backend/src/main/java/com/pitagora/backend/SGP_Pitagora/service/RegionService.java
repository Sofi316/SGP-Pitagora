package com.pitagora.backend.SGP_Pitagora.service;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.Region;

import com.pitagora.backend.SGP_Pitagora.repository.RegionRepository;
@Service
public class RegionService {
    private final RegionRepository regionRepository;
    public RegionService(RegionRepository regionRepository){
        this.regionRepository= regionRepository;
    }
    public List<Region> findAll(){
        return regionRepository.findAll();
    }
    public Region findById(Long id){
        return regionRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Región no encontrada"));
    }
    public Region save(Region region){
        return regionRepository.save(region);
    }
 
    

}
