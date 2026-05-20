package com.pitagora.backend.SGP_Pitagora.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.pitagora.backend.SGP_Pitagora.model.ComunicacionArchivada;
import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.repository.ComunicacionArchivadaRepository;

@Service
public class EmailSenderService {

    private static final Logger logger = LoggerFactory.getLogger(EmailSenderService.class);

    private final JavaMailSender mailSender;
    private final ComunicacionArchivadaRepository comunicacionRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailSenderService(JavaMailSender mailSender, ComunicacionArchivadaRepository comunicacionRepository) {
        this.mailSender = mailSender;
        this.comunicacionRepository = comunicacionRepository;
    }

    public void enviarYArchivarCorreo(String destinatario, String asunto, String cuerpoMensaje, Solicitud solicitud) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(destinatario);
            message.setSubject(asunto);
            message.setText(cuerpoMensaje);
            
            mailSender.send(message);

            ComunicacionArchivada comunicacion = new ComunicacionArchivada();
            comunicacion.setSolicitud(solicitud);
            comunicacion.setRemitente(fromEmail);
            comunicacion.setDestinatario(destinatario);
            comunicacion.setAsunto(asunto);
            comunicacion.setCuerpoMensaje(cuerpoMensaje);
            comunicacion.setFechaEnvio(LocalDateTime.now());
            
            comunicacionRepository.save(comunicacion);
            
        } catch (Exception e) {
            logger.error("Error enviando correo a {}: {}", destinatario, e.getMessage(), e);
        }
    }
}