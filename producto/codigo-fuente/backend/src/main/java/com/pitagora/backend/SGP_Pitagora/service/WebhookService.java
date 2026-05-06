package com.pitagora.backend.SGP_Pitagora.service;

import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.pitagora.backend.SGP_Pitagora.dto.EmailWebhookDto;
import com.pitagora.backend.SGP_Pitagora.model.ComunicacionArchivada;
import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.repository.ComunicacionArchivadaRepository;
import com.pitagora.backend.SGP_Pitagora.repository.SolicitudRepository;

@Service
public class WebhookService {
    private final SolicitudRepository solicitudRepository;
    private final ComunicacionArchivadaRepository comunicacionRepository;
    private final JavaMailSender mailSender;

    public WebhookService(SolicitudRepository solicitudRepository, 
                          ComunicacionArchivadaRepository comunicacionRepository,
                          JavaMailSender mailSender) {
        this.solicitudRepository = solicitudRepository;
        this.comunicacionRepository = comunicacionRepository;
        this.mailSender = mailSender;
    }

    public void procesarCorreoEntrante(EmailWebhookDto emailDto) {
        Long id = extraerIdAsunto(emailDto.getSubject());

        if (id == null) {
            System.out.println("Webhook ignorado: No se encontró ID en el asunto -> " + emailDto.getSubject());
            return;
        }

        Solicitud solicitud = solicitudRepository.findById(id).orElse(null);
        
        if (solicitud == null) {
            System.out.println("Webhook ignorado: Solicitud ID " + id + " no existe.");
            return;
        }

        ComunicacionArchivada nuevaCom = new ComunicacionArchivada();
        nuevaCom.setSolicitud(solicitud);
        nuevaCom.setAsunto(emailDto.getSubject());
        nuevaCom.setCuerpoMensaje(emailDto.getBodyPlain());
        nuevaCom.setRemitente(emailDto.getSender());
        nuevaCom.setDestinatario("postventa@pitagoras.cl");
        nuevaCom.setFechaEnvio(LocalDateTime.now());
        
        comunicacionRepository.save(nuevaCom);
        enviarAlertaFrancisco(id);
    }

    private Long extraerIdAsunto(String asunto) {
        if (asunto == null) return null;
        
        Pattern pattern = Pattern.compile("\\[ID-(\\d+)\\]");
        Matcher matcher = pattern.matcher(asunto);
        
        if (matcher.find()) {
            return Long.valueOf(matcher.group(1));
        }
        return null;
    }

    private void enviarAlertaFrancisco(Long id) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("correo.francisco@pitagoras.cl");
        message.setSubject("Nuevo mensaje del cliente - ID: " + id);
        message.setText("El cliente ha respondido al correo. Revisa y responde aquí: " +
                        "http://localhost:3000/admin/solicitudes/" + id);
        mailSender.send(message);
    }
}