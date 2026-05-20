package com.pitagora.backend.SGP_Pitagora.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException ex) {
        return ResponseEntity
                .status(ex.getStatusCode())
                .body(ex.getReason());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String message = ex.getMessage();
        
        // Detectar violación de constraint de correo único
        if (message != null && message.contains("usuario_correo_key")) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("El correo electrónico ya está en uso por otro usuario.");
        }
        
        // Detectar violación de constraint de RUT único
        if (message != null && message.contains("usuario_rut_key")) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("El RUT ya está en uso por otro usuario.");
        }
        
        // Error genérico de integridad
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body("Error de integridad de datos: " + ex.getMostSpecificCause().getMessage());
    }
}