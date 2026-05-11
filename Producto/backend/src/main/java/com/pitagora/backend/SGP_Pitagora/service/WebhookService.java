/*package com.pitagora.backend.SGP_Pitagora.service;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.dto.EmailWebhookDto;
import com.pitagora.backend.SGP_Pitagora.model.ComunicacionArchivada;
import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.repository.ComunicacionArchivadaRepository;

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
        Long idSolicitud = extraerIdAsunto(emailDto.getSubject());

        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada para el ID: " + idSolicitud));

        ComunicacionArchivada nuevaCom = new ComunicacionArchivada();
        nuevaCom.setSolicitud(solicitud);
        nuevaCom.setAsunto(emailDto.getSubject());
        nuevaCom.setCuerpoMensaje(emailDto.getBodyPlain());
        nuevaCom.setRemitente(emailDto.getSender());
        nuevaCom.setFechaEnvio(LocalDateTime.now());
        
        comunicacionRepository.save(nuevaCom);
        enviarAlertaFrancisco(idSolicitud);
    }

    private Long extraerIdAsunto(String asunto) {
        Pattern pattern = Pattern.compile("\\[ID-(\\d+)\\]");
        Matcher matcher = pattern.matcher(asunto);
        if (matcher.find()) {
            return Long.parseLong(matcher.group(1));
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se encontró ID válido en el asunto");
    }

    private void enviarAlertaFrancisco(Long idSolicitud) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("correo.francisco@pitagoras.cl"); // Correo de Francisco
        message.setSubject("Nuevo mensaje del cliente - ID: " + idSolicitud);
        message.setText("Francisco, el cliente ha respondido al correo. Revisa y responde aquí: " +
                        "http://localhost:3000/admin/solicitudes/" + idSolicitud);
        mailSender.send(message);
    }
}
*/