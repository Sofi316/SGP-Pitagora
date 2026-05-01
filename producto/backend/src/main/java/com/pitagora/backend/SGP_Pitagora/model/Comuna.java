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
@Table(name="comuna")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Comuna {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_comuna")
    private Long id;

    @Column(name="nombre_comuna", nullable=false)
    private String nombre;

    @ManyToOne
    @JoinColumn(name="id_region", nullable=false)
    private Region region;
}
