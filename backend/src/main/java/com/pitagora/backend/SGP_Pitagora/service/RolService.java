package com.pitagora.backend.SGP_Pitagora.service;
import java.util.List;
import java.util.Optional;
import com.pitagora.backend.SGP_Pitagora.model.Rol;
import com.pitagora.backend.SGP_Pitagora.repository.RolRepository;

public class RolService {
    private final RolRepository rolRepository;
    public RolService(RolRepository rolRepository){
        this.rolRepository= rolRepository;
    }
    public List<Rol> findAll(){
        return rolRepository.findAll();
    }
    public Optional<Rol> findById(Long id){
        return rolRepository.findById(id);
    }
    public Rol save(Rol rol){
        return rolRepository.save(rol);
    }

    public Rol update(Long id, Rol rolModificado){
        Optional <Rol> rolExistente= rolRepository.findById(id);
        if(rolExistente.isPresent()){
            Rol rolAEditar= rolExistente.get();
            rolAEditar.setNombre(rolModificado.getNombre());
            return rolRepository.save(rolAEditar);
        
        }else{
            return null;
        }
    
    
    
    }
}
