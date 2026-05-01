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
@Table(name="empresa_cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpresaCliente {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_empresa_cliente")
    private Long id;

    @Column(name="rut_empresa", nullable=false, unique=true)
    private String rut;

    @Column(name="razon_social", nullable=false)
    private String razonSocial;

    @Column(nullable = false)
    private Boolean activo = true;
}
