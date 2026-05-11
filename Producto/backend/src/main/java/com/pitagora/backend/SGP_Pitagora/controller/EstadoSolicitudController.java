package com.pitagora.backend.SGP_Pitagora.controller;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pitagora.backend.SGP_Pitagora.model.EstadoSolicitud;
import com.pitagora.backend.SGP_Pitagora.service.EstadoSolicitudService;

@RestController
@RequestMapping("api/estados-solicitud")
public class EstadoSolicitudController {

    private final EstadoSolicitudService estadoSolicitudService;

    public EstadoSolicitudController (EstadoSolicitudService estadoSolicitudService){
        this.estadoSolicitudService = estadoSolicitudService;
    }

    @GetMapping
    public List<EstadoSolicitud> getAll(){
        return estadoSolicitudService.findAll();
    }
    @GetMapping("/{id}")
    public EstadoSolicitud getById(@PathVariable Long id) {
        return estadoSolicitudService.findById(id);
    }
    @PostMapping
    public EstadoSolicitud create(@RequestBody EstadoSolicitud estadoSolicitud){
        return estadoSolicitudService.save(estadoSolicitud);
    }
    @PutMapping("/{id}")
    public EstadoSolicitud update(@PathVariable Long id, @RequestBody EstadoSolicitud estadoSolicitud){
        estadoSolicitud.setId(id);
        return estadoSolicitudService.save(estadoSolicitud);
    }
}
