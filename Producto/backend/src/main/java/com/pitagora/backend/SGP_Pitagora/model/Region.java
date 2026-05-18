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
@Table(name="region")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Region {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_region")
    private Long id;

    @Column(name="nombre_region", nullable=false)
    private String nombre;
}
