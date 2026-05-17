package com.pitagora.backend.SGP_Pitagora.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.dto.MensajeSalienteDto;
import com.pitagora.backend.SGP_Pitagora.model.ComunicacionArchivada;
import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.repository.ComunicacionArchivadaRepository;
import com.pitagora.backend.SGP_Pitagora.repository.SolicitudRepository;

@Service
public class ComunicacionArchivadaService {

    private final ComunicacionArchivadaRepository comunicacionArchivadaRepository;
    private final SolicitudRepository solicitudRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String mailFrom;

    public ComunicacionArchivadaService(ComunicacionArchivadaRepository comunicacionArchivadaRepository,
                                        SolicitudRepository solicitudRepository,
                                        JavaMailSender mailSender) {
        this.comunicacionArchivadaRepository = comunicacionArchivadaRepository;
        this.solicitudRepository = solicitudRepository;
        this.mailSender = mailSender;
    }

    public ComunicacionArchivada enviarRespuestaCliente(Long id, MensajeSalienteDto dto) {
        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));

        String asuntoConId = dto.getAsunto() + " [ID-" + id + "]";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(dto.getDestinatario());
        message.setSubject(asuntoConId);
        message.setText(dto.getCuerpoMensaje());
        mailSender.send(message);

        ComunicacionArchivada nuevaCom = new ComunicacionArchivada();
        nuevaCom.setSolicitud(solicitud);
        nuevaCom.setAsunto(asuntoConId);
        nuevaCom.setCuerpoMensaje(dto.getCuerpoMensaje());
        nuevaCom.setRemitente("isuminnn316@gmail.com"); 
        nuevaCom.setDestinatario(dto.getDestinatario());
        nuevaCom.setFechaEnvio(LocalDateTime.now());

        return comunicacionArchivadaRepository.save(nuevaCom);
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
        Long id, LocalDate fechaInicio, LocalDate fechaFin, String keyword) {
        
        LocalDateTime inicio = fechaInicio != null ? fechaInicio.atStartOfDay() : null;
        LocalDateTime fin = fechaFin != null ? fechaFin.atTime(23, 59, 59, 999999999) : null;
        String keywordProcesada = (keyword != null && !keyword.isBlank()) ? "%" + keyword.toLowerCase() + "%" : null;

        return comunicacionArchivadaRepository.filtrarComunicaciones(id, inicio, fin, keywordProcesada);
    }
}