package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;

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

    public List<ComunicacionArchivada> listarPorSolicitud(Long id) {
        return comunicacionArchivadaRepository.findBySolicitudId(id);
    }

    public Optional<ComunicacionArchivada> findById(Long id) {
        return comunicacionArchivadaRepository.findById(id);
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

    public boolean delete(Long id) {
        ComunicacionArchivada comunicacion = comunicacionArchivadaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunicación archivada no encontrada"));

        comunicacionArchivadaRepository.delete(comunicacion);
        return true;
    }

}
