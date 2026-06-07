package com.pitagora.backend.SGP_Pitagora.dto;

import java.time.LocalDateTime;
import java.util.List;
import com.pitagora.backend.SGP_Pitagora.model.ArchivoEvidencia;

public class SolicitudPublicoDto {
    private Long id;
    private LocalDateTime fechaIngreso;
    private String descripcion;
    private String ubicacionExacta;
    private String categoriaNombre;
    private String subCategoriaNombre;
    private String obraNombre;
    private List<ArchivoEvidencia> evidencias;

    public SolicitudPublicoDto(Long id, LocalDateTime fechaIngreso, String descripcion, String ubicacionExacta,
                               String categoriaNombre, String subCategoriaNombre, String obraNombre, List<ArchivoEvidencia> evidencias) {
        this.id = id;
        this.fechaIngreso = fechaIngreso;
        this.descripcion = descripcion;
        this.ubicacionExacta = ubicacionExacta;
        this.categoriaNombre = categoriaNombre;
        this.subCategoriaNombre = subCategoriaNombre;
        this.obraNombre = obraNombre;
        this.evidencias = evidencias;
    }

    public Long getId() { return id; }
    public LocalDateTime getFechaIngreso() { return fechaIngreso; }
    public String getDescripcion() { return descripcion; }
    public String getUbicacionExacta() { return ubicacionExacta; }
    public String getCategoriaNombre() { return categoriaNombre; }
    public String getSubCategoriaNombre() { return subCategoriaNombre; }
    public String getObraNombre() { return obraNombre; }
    public List<ArchivoEvidencia> getEvidencias() { return evidencias; }
}