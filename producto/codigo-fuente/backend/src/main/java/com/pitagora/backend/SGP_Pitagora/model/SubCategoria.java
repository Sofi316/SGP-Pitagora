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
@Table(name="subcategoria")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubCategoria {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_subcategoria")
    private Long id;

    @Column(name="nombre_subcategoria", nullable=false)
    private String nombre;

    @Column(nullable = false)
    private Boolean activo = true;

    @ManyToOne
    @JoinColumn(name="id_categoria",nullable=false)
    private Categoria categoria;
}
