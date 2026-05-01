package com.pitagora.backend.SGP_Pitagora.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.ComunicacionArchivada;
import com.pitagora.backend.SGP_Pitagora.repository.ComunicacionArchivadaRepository;

@Service
public class ComunicacionArchivadaService {

    private final ComunicacionArchivadaRepository comunicacionArchivadaRepository;

    public ComunicacionArchivadaService(ComunicacionArchivadaRepository comunicacionArchivadaRepository) {
        this.comunicacionArchivadaRepository = comunicacionArchivadaRepository;
    }

    public List<ComunicacionArchivada> findAll() {
        return comunicacionArchivadaRepository.findAll();
    }

    public ComunicacionArchivada findById(Long id) {
        return comunicacionArchivadaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunicación archivada no encontrada"));
    }

    public ComunicacionArchivada save(ComunicacionArchivada comunicacion) {
        return comunicacionArchivadaRepository.save(comunicacion);
    }

    public ComunicacionArchivada update(Long id, ComunicacionArchivada comunicacionModificada) {
        ComunicacionArchivada comunicacionAntigua = comunicacionArchivadaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunicación archivada no encontrada"));

        comunicacionAntigua.setExternalMessageId(comunicacionModificada.getExternalMessageId());
        comunicacionAntigua.setAsunto(comunicacionModificada.getAsunto());
        comunicacionAntigua.setCuerpoMensaje(comunicacionModificada.getCuerpoMensaje());
        comunicacionAntigua.setRemitente(comunicacionModificada.getRemitente());
        comunicacionAntigua.setDestinatario(comunicacionModificada.getDestinatario());
        comunicacionAntigua.setFechaEnvio(comunicacionModificada.getFechaEnvio());
        comunicacionAntigua.setSolicitud(comunicacionModificada.getSolicitud());

        return comunicacionArchivadaRepository.save(comunicacionAntigua);
    }

    public List<ComunicacionArchivada> filtrarComunicaciones(
        Long id,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        String keyword
    ) {
        LocalDateTime inicio = null;
        LocalDateTime fin = null;

        if (fechaInicio != null) {
            inicio = fechaInicio.atStartOfDay(); 
        }
        
        if (fechaFin != null) {
            fin = fechaFin.atTime(23, 59, 59, 999999999);
        }

        String keywordProcesada = null;
        if (keyword != null && !keyword.isBlank()) {
            keywordProcesada = "%" + keyword.toLowerCase() + "%";
        }

        return comunicacionArchivadaRepository.filtrarComunicaciones(
                id,
                inicio,
                fin,
                keywordProcesada
        );
    }
}
