package com.pitagora.backend.SGP_Pitagora.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="tipo_evidencia")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class TipoEvidencia {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_tipo_evidencia")
    private Long id;

    @Column(name="nombre_tipo_evidencia", nullable=false)
    private String nombre;
}
