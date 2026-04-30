package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;
import com.pitagora.backend.SGP_Pitagora.model.EstadoSolicitud;
import com.pitagora.backend.SGP_Pitagora.repository.EstadoSolicitudRepository;

public class EstadoSolicitudService {
    private final EstadoSolicitudRepository estadoSolicitudRepository;
    public EstadoSolicitudService(EstadoSolicitudRepository estadoSolicitudRepository){
        this.estadoSolicitudRepository= estadoSolicitudRepository;
    }

    public List<EstadoSolicitud> findAll(){
        return estadoSolicitudRepository.findAll();
    }
   
    public Optional <EstadoSolicitud> findById(Long id){
        return estadoSolicitudRepository.findById(id);
    }
    public EstadoSolicitud save(EstadoSolicitud estadoSolicitud){
        return estadoSolicitudRepository.save(estadoSolicitud);
    }
    public EstadoSolicitud update(Long id, EstadoSolicitud estadoSolModificada){
        Optional<EstadoSolicitud> estadoSolExistente= estadoSolicitudRepository.findById(id);

        if(estadoSolExistente.isPresent()){
            EstadoSolicitud estadoSolAEditar= estadoSolExistente.get();

            estadoSolAEditar.setNombre(estadoSolModificada.getNombre());
            return estadoSolicitudRepository.save(estadoSolAEditar);
        }else{
            return null;
        }
    }


}
