package com.pitagora.backend.SGP_Pitagora.model;

import java.time.LocalDate;

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
@Table(name="obra")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Obra {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_obra")
    private Long id;

    @Column(name="nombre_obra",nullable = false)
    private String nombre;

    @Column(name="direccion_obra",nullable = false)
    private String direccion;

    @Column(name="fecha_inicio_postventa",nullable = false)
    private LocalDate fechaInicioPostventa;

    @Column(name="fecha_cierre_postventa",nullable = false)
    private LocalDate fechaCierrePostventa;

    @Column(name="ruta_acta_entrega",columnDefinition="TEXT")
    private String rutaActaEntrega;

    @ManyToOne
    @JoinColumn(name="id_empresa_cliente", nullable=false)
    private EmpresaCliente empresaCliente;
}