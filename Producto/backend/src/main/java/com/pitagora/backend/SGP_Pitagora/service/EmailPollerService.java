package com.pitagora.backend.SGP_Pitagora.service;

import java.time.LocalDateTime;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.pitagora.backend.SGP_Pitagora.repository.UsuarioRepository;
import com.pitagora.backend.SGP_Pitagora.model.ComunicacionArchivada;
import com.pitagora.backend.SGP_Pitagora.model.EstadoSolicitud;
import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.repository.ComunicacionArchivadaRepository;
import com.pitagora.backend.SGP_Pitagora.repository.EstadoSolicitudRepository;
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
    private final EmailSenderService emailSenderService;
    private final EstadoSolicitudRepository estadoSolicitudRepository;
    private final UsuarioRepository usuarioRepository;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    @Value("${mail.imap.host}")
    private String host;

    public EmailPollerService(SolicitudRepository solicitudRepository, 
                               ComunicacionArchivadaRepository comunicacionRepository,
                               EmailSenderService emailSenderService,
                               EstadoSolicitudRepository estadoSolicitudRepository,
                               UsuarioRepository usuarioRepository) {
        this.solicitudRepository = solicitudRepository;
        this.comunicacionRepository = comunicacionRepository;
        this.emailSenderService = emailSenderService;
        this.estadoSolicitudRepository = estadoSolicitudRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Scheduled(fixedRate = 120000)
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
    /* 
    @Scheduled(cron = "0 0 9 * * *") // Se ejecuta todos los días a las 09:00 AM
    @Transactional
    public void procesarRecordatoriosYCierresAutomaticos() {
        // Buscar solicitudes en estado TERMINADO (id = 3)
        List<Solicitud> solicitudesTerminadas = solicitudRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getActivo()) && s.getEstadoSolicitud().getId().equals(3L))
                .toList();

        LocalDateTime ahora = LocalDateTime.now();

        for (Solicitud sol : solicitudesTerminadas) {
            
            boolean tokenExpiro = sol.getFechaExpiracionToken() != null && sol.getFechaExpiracionToken().isBefore(ahora);
            boolean limiteRecordatoriosAlcanzado = sol.getContadorRecordatorios() != null && sol.getContadorRecordatorios() >= 4;

            // LÓGICA DE CIERRE AUTOMÁTICO
            if (tokenExpiro || limiteRecordatoriosAlcanzado) {
                // Estado 4 = APROBADO
                EstadoSolicitud estadoAprobado = estadoSolicitudRepository.findById(4L).orElseThrow();
                sol.setEstadoSolicitud(estadoAprobado);
                sol.setComentarioCierre("Aprobación automática por el sistema: Plazo expirado o límite de recordatorios alcanzado sin respuesta del cliente.");
                sol.setFechaFirma(ahora);
                sol.setTokenConformidad(null);
                sol.setFechaExpiracionToken(null);
                solicitudRepository.save(sol);

                // Notificar cierre automático
                String asunto = "Aprobación Automática SGP Pitagora [ID-" + sol.getId() + "]";
                String cuerpo = "El sistema ha aprobado automáticamente la solicitud debido a que el plazo de respuesta ha expirado sin recibir evaluación.";
                
                List<String> correos = sol.getObra() != null ? usuarioRepository.findCorreosByObraId(sol.getObra().getId()) : List.of();
                for (String correo : correos) {
                    emailSenderService.enviarYArchivarCorreo(correo, asunto, cuerpo, sol);
                }
                continue; 
            }

            // LÓGICA DE RECORDATORIOS (Si han pasado 7 días desde el último)
            LocalDateTime fechaReferencia = sol.getFechaUltimoRecordatorio() != null ? sol.getFechaUltimoRecordatorio() : sol.getFechaExpiracionToken().minusWeeks(4);
            
            if (fechaReferencia.plusDays(7).isBefore(ahora)) {
                int nuevoContador = (sol.getContadorRecordatorios() == null ? 0 : sol.getContadorRecordatorios()) + 1;
                
                sol.setContadorRecordatorios(nuevoContador);
                sol.setFechaUltimoRecordatorio(ahora);
                solicitudRepository.save(sol);

                String asunto = "Recordatorio #" + nuevoContador + " - Conformidad Requerida SGP Pitagora [ID-" + sol.getId() + "]";
                String enlace = "http://localhost:3000/conformidad/" + sol.getTokenConformidad(); // Ajustar con variable de entorno si tienes
                String cuerpo = "Estimado cliente,\n\nLe recordamos que aún está pendiente su evaluación para el trabajo finalizado en la solicitud #" + sol.getId() + ".\n\nPor favor, ingrese al siguiente enlace para emitir su respuesta:\n" + enlace + "\n\nEste es el recordatorio número " + nuevoContador + " de 4.";

                List<String> correos = sol.getObra() != null ? usuarioRepository.findCorreosByObraId(sol.getObra().getId()) : List.of();
                for (String correo : correos) {
                    emailSenderService.enviarYArchivarCorreo(correo, asunto, cuerpo, sol);
                }
            }
        }
    }*/
    @Scheduled(fixedRate = 20000)
    @Transactional
    public void procesarRecordatoriosYCierresAutomaticos() {
        System.out.println("\n[POLLER] Ejecutando revision: " + LocalDateTime.now());

        List<Solicitud> solicitudesTerminadas = solicitudRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getActivo()) && s.getEstadoSolicitud() != null && s.getEstadoSolicitud().getId().equals(3L))
                .toList();

        LocalDateTime ahora = LocalDateTime.now();

        for (Solicitud sol : solicitudesTerminadas) {
            // Saltamos las que no tienen token para evitar errores
            if (sol.getFechaExpiracionToken() == null) continue;

            int recordatoriosEnviados = sol.getContadorRecordatorios() != null ? sol.getContadorRecordatorios() : 0;
            System.out.println("-> Evaluando Solicitud ID: " + sol.getId() + " | Recordatorios enviados: " + recordatoriosEnviados);
            
            boolean tokenExpiro = sol.getFechaExpiracionToken().isBefore(ahora);
            LocalDateTime fechaReferencia = sol.getFechaUltimoRecordatorio() != null ? sol.getFechaUltimoRecordatorio() : sol.getFechaExpiracionToken().minusWeeks(4);
            
            // ¿Ya pasó el intervalo de tiempo (45 segs en prueba / 7 días real)?
            boolean tiempoCumplido = fechaReferencia.plusSeconds(45).isBefore(ahora);

            // 1. LÓGICA DE CIERRE (Si expiró el token real, o si ya mandamos los 3 recordatorios Y pasó el último intervalo de tiempo)
            if (tokenExpiro || (tiempoCumplido && recordatoriosEnviados >= 3)) {
                System.out.println("[POLLER] Cerrando solicitud automaticamente ID: " + sol.getId());
                
                EstadoSolicitud estadoAprobado = estadoSolicitudRepository.findById(4L).orElseThrow();
                sol.setEstadoSolicitud(estadoAprobado);
                sol.setComentarioCierre("Aprobación automática por el sistema: Plazo expirado o límite de recordatorios alcanzado.");
                sol.setFechaFirma(ahora);
                sol.setTokenConformidad(null);
                sol.setFechaExpiracionToken(null);
                solicitudRepository.save(sol);

                String asunto = "Aprobación Automática SGP Pitagora [ID-" + sol.getId() + "]";
                String cuerpo = "El sistema ha aprobado automáticamente la solicitud debido a que el plazo de respuesta ha expirado sin recibir evaluación del cliente.";
                
                List<String> correos = sol.getObra() != null ? usuarioRepository.findCorreosByObraId(sol.getObra().getId()) : List.of();
                for (String correo : correos) {
                    emailSenderService.enviarYArchivarCorreo(correo, asunto, cuerpo, sol);
                }
            } 
            // 2. LÓGICA DE RECORDATORIOS (Si pasó el tiempo y aún no llegamos a los 3 recordatorios)
            else if (tiempoCumplido && recordatoriosEnviados < 3) {
                int nuevoContador = recordatoriosEnviados + 1;
                System.out.println("[POLLER] Disparando Recordatorio #" + nuevoContador + " para la Solicitud ID: " + sol.getId());
                
                sol.setContadorRecordatorios(nuevoContador);
                sol.setFechaUltimoRecordatorio(ahora);
                solicitudRepository.save(sol);

                String asunto = "Recordatorio #" + nuevoContador + " - Conformidad Requerida SGP Pitagora [ID-" + sol.getId() + "]";
                String enlace = "http://localhost:3000/conformidad/" + sol.getTokenConformidad();
                String cuerpo = "Estimado cliente,\n\nLe recordamos que aún está pendiente su evaluación para el trabajo finalizado en la solicitud #" + sol.getId() + ".\n\nPor favor, ingrese al siguiente enlace para emitir su respuesta:\n" + enlace;

                List<String> correos = sol.getObra() != null ? usuarioRepository.findCorreosByObraId(sol.getObra().getId()) : List.of();
                for (String correo : correos) {
                    emailSenderService.enviarYArchivarCorreo(correo, asunto, cuerpo, sol);
                }
            }
        }
    }

}