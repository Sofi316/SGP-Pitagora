package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.EstadoSolicitud;
import com.pitagora.backend.SGP_Pitagora.repository.EstadoSolicitudRepository;

@Service
public class EstadoSolicitudService {
    private final EstadoSolicitudRepository estadoSolicitudRepository;
    public EstadoSolicitudService(EstadoSolicitudRepository estadoSolicitudRepository){
        this.estadoSolicitudRepository= estadoSolicitudRepository;
    }

    public List<EstadoSolicitud> findAll(){
        return estadoSolicitudRepository.findAll();
    }
   
    public EstadoSolicitud findById(Long id){
        return estadoSolicitudRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estado de Solicitud no encontrado"));
    }
    public EstadoSolicitud save(EstadoSolicitud estadoSolicitud){
        return estadoSolicitudRepository.save(estadoSolicitud);
    }
   

}
