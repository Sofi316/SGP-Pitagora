package com.pitagora.backend.SGP_Pitagora.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="comunicacion_archivada")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComunicacionArchivada {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_comunicacion")
    private Long id;

    @Column(name="external_message_id", unique=true)
    private String externalMessageId;

    @Column(nullable=false)
    private String asunto;

    @Column(columnDefinition="TEXT", nullable=false)
    private String cuerpoMensaje;

    @Column(nullable=false)
    private String remitente;

    @Column(nullable=false)
    private String destinatario;

    @Column(nullable=false)
    private LocalDateTime fechaEnvio;

    @ManyToOne
    @JoinColumn(name="id_solicitud", nullable=false)
    private Solicitud solicitud;

}
