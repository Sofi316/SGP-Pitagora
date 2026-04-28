package com.pitagora.backend.SGP_Pitagora.model;

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
@Table(name="archivo_evidencia")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoEvidencia {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_archivo_evidencia")
    private Long id;

    @Column(name="ruta_archivo", columnDefinition= "TEXT", nullable=false)
    private String rutaArchivo;

    @ManyToOne
    @JoinColumn(name="id_tipo_evidencia", nullable=false)
    private TipoEvidencia tipoEvidencia;

    //private Solicitud solicitud;

}
