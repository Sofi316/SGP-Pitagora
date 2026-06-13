package com.pitagora.backend.SGP_Pitagora.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="solicitud")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long id;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDateTime fechaIngreso;

    @Column(name = "fecha_hallazgo", nullable = false)
    private LocalDate fechaHallazgo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Column(name = "ubicacion_exacta", nullable = false)
    private String ubicacionExacta;

    @Column(name = "token_validacion", unique = true)
    private String tokenValidacion;

    @Column(name = "fecha_firma")
    private LocalDateTime fechaFirma;

    @Column(name = "comentario_cierre", columnDefinition = "TEXT")
    private String comentarioCierre;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "calificacion")
    private Integer calificacion;
    
    @Column(name = "costo_reparacion")
    private Long costoReparacion = 0L;
    
    @ManyToOne
    @JoinColumn(name = "id_estado", nullable = false)
    private EstadoSolicitud estadoSolicitud;

    @ManyToOne
    @JoinColumn(name = "id_subcategoria", nullable = false)
    private SubCategoria subCategoria;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    @JsonIgnoreProperties("obras")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_obra", nullable = false)
    private Obra obra;
    
    @Column(name = "token_conformidad", unique = true)
    private String tokenConformidad;

    @Column(name = "fecha_expiracion_token")
    private LocalDateTime fechaExpiracionToken;

    @Column(name = "contador_recordatorios")
    private Integer contadorRecordatorios = 0;

    @Column(name = "fecha_ultimo_recordatorio")
    private LocalDateTime fechaUltimoRecordatorio;

    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    @PrePersist
    protected void onCreate() {
        this.fechaIngreso = LocalDateTime.now();
    }
}
