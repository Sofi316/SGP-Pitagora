package com.pitagora.backend.SGP_Pitagora.service;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.Rol;
import com.pitagora.backend.SGP_Pitagora.repository.RolRepository;
@Service
public class RolService {
    private final RolRepository rolRepository;
    public RolService(RolRepository rolRepository){
        this.rolRepository= rolRepository;
    }
    public List<Rol> findAll(){
        return rolRepository.findAll();
    }
    public Rol findById(Long id){
        return rolRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado"));
    }
    public Rol save(Rol rol){
        return rolRepository.save(rol);
    }

}
