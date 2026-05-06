package com.pitagora.backend.SGP_Pitagora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MensajeSalienteDto {
    private String destinatario;
    private String asunto;
    private String cuerpoMensaje;
}