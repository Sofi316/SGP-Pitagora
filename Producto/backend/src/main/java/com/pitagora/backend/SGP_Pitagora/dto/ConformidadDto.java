package com.pitagora.backend.SGP_Pitagora.dto;

public class ConformidadDto {
    private Boolean conforme;
    private String motivoRechazo;
    private Integer calificacion;

    public ConformidadDto() {}

    public Boolean getConforme() { return conforme; }
    public void setConforme(Boolean conforme) { this.conforme = conforme; }

    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }

    public Integer getCalificacion() { return calificacion; }
    public void setCalificacion(Integer calificacion) { this.calificacion = calificacion; }
}