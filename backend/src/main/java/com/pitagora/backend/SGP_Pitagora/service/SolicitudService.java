package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.repository.SolicitudRepository;

@Service
public class SolicitudService {

    @Autowired
    private SolicitudRepository solicitudRepository;

    public List<Solicitud> obtenerTodas() {
        return solicitudRepository.findAll();
    }

    public Optional<Solicitud> obtenerPorId(Long id) {
        return solicitudRepository.findById(id);
    }

    public List<Solicitud> obtenerPorUsuario(Long idUsuario) {
        return solicitudRepository.findByUsuarioId(idUsuario);
    }

    public List<Solicitud> obtenerPorObra(Long idObra) {
        return solicitudRepository.findByObraId(idObra);
    }

    public Solicitud guardar(Solicitud solicitud) {
        return solicitudRepository.save(solicitud);
    }

    public void eliminar(Long id) {
        solicitudRepository.deleteById(id);
    }
}