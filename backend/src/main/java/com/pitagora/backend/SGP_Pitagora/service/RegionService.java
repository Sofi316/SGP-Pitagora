package com.pitagora.backend.SGP_Pitagora.service;
import java.util.List;
import java.util.Optional;

import com.pitagora.backend.SGP_Pitagora.model.Region;

import com.pitagora.backend.SGP_Pitagora.repository.RegionRepository;

public class RegionService {
    private final RegionRepository regionRepository;
    public RegionService(RegionRepository regionRepository){
        this.regionRepository= regionRepository;
    }
    public List<Region> findAll(){
        return regionRepository.findAll();
    }
    public Optional<Region> findById(Long id){
        return regionRepository.findById(id);
    }
    public Region save(Region region){
        return regionRepository.save(region);
    }
    public Region update(Long id, Region regionModificada){
        Optional <Region> regionExistente= regionRepository.findById(id);
        if(regionExistente.isPresent()){
            Region regionAEditar= regionExistente.get();
            regionAEditar.setNombre(regionModificada.getNombre());
            return regionRepository.save(regionAEditar);
        
        }else{
            return null;
        }
    
    
    
    }
    
    

}
