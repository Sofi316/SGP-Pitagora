package com.pitagora.backend.SGP_Pitagora.service;

import java.time.LocalDateTime;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.pitagora.backend.SGP_Pitagora.model.ComunicacionArchivada;
import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.repository.ComunicacionArchivadaRepository;
import com.pitagora.backend.SGP_Pitagora.repository.SolicitudRepository;

import jakarta.mail.BodyPart;
import jakarta.mail.Flags;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.Store;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.search.FlagTerm;

@Service
public class EmailPollerService {

    private final SolicitudRepository solicitudRepository;
    private final ComunicacionArchivadaRepository comunicacionRepository;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    @Value("${mail.imap.host}")
    private String host;

    public EmailPollerService(SolicitudRepository solicitudRepository, 
                               ComunicacionArchivadaRepository comunicacionRepository) {
        this.solicitudRepository = solicitudRepository;
        this.comunicacionRepository = comunicacionRepository;
    }

    @Scheduled(fixedRate = 15000)
    public void leerCorreosNuevos() {
        Properties props = new Properties();
        props.put("mail.store.protocol", "imaps");

        try {
            Session session = Session.getInstance(props);
            Store store = session.getStore("imaps");
            store.connect(host, username, password);

            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_WRITE);

            Message[] mensajes = inbox.search(new FlagTerm(new Flags(Flags.Flag.SEEN), false));

            for (Message msg : mensajes) {
                procesarMensaje(msg);
                msg.setFlag(Flags.Flag.SEEN, true);
            }

            inbox.close(false);
            store.close();
        } catch (Exception e) {
            System.err.println("Error al leer correos IMAP: " + e.getMessage());
        }
    }

    private void procesarMensaje(Message msg) throws Exception {
        String asunto = msg.getSubject();
        Long idSolicitud = extraerIdAsunto(asunto);

        if (idSolicitud != null) {
            Solicitud solicitud = solicitudRepository.findById(idSolicitud).orElse(null);
            if (solicitud != null) {
                ComunicacionArchivada nuevaCom = new ComunicacionArchivada();
                nuevaCom.setSolicitud(solicitud);
                nuevaCom.setAsunto(asunto);
                nuevaCom.setCuerpoMensaje(getTextFromMessage(msg));
                nuevaCom.setRemitente(msg.getFrom()[0].toString());
                nuevaCom.setDestinatario(username);
                nuevaCom.setFechaEnvio(LocalDateTime.now());
                
                comunicacionRepository.save(nuevaCom);
                System.out.println("Correo guardado para solicitud ID: " + idSolicitud);
            }
        }
    }

    private Long extraerIdAsunto(String asunto) {
        if (asunto == null) return null;
        Pattern pattern = Pattern.compile("\\[ID-(\\d+)\\]");
        Matcher matcher = pattern.matcher(asunto);
        return matcher.find() ? Long.valueOf(matcher.group(1)) : null;
    }

    private String getTextFromMessage(Message message) throws Exception {
        if (message.isMimeType("text/plain")) {
            return message.getContent().toString();
        } else if (message.isMimeType("multipart/*")) {
            MimeMultipart mimeMultipart = (MimeMultipart) message.getContent();
            return getTextFromMimeMultipart(mimeMultipart);
        }
        return "";
    }

    private String getTextFromMimeMultipart(MimeMultipart mimeMultipart) throws Exception {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < mimeMultipart.getCount(); i++) {
            BodyPart bodyPart = mimeMultipart.getBodyPart(i);
            if (bodyPart.isMimeType("text/plain")) {
                result.append(bodyPart.getContent());
            } else if (bodyPart.isMimeType("text/html")) {
            } else if (bodyPart.getContent() instanceof MimeMultipart) {
                result.append(getTextFromMimeMultipart((MimeMultipart) bodyPart.getContent()));
            }
        }
        return result.toString();
    }
}