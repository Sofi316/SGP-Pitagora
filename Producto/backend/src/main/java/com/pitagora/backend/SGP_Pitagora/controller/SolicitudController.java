package com.pitagora.backend.SGP_Pitagora.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pitagora.backend.SGP_Pitagora.model.Solicitud;
import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.service.SolicitudService;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;

    public SolicitudController (SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @GetMapping 
    public ResponseEntity<List<Solicitud>> listarTodas() {
        return ResponseEntity.ok(solicitudService.obtenerTodas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id, @AuthenticationPrincipal Usuario principal) {
    Solicitud solicitud = solicitudService.obtenerPorId(id);
    
    if (principal.getRol().getNombre().equals("ROLE_CLIENTE")) {
        // 1. Validar consistencia de los datos de la solicitud consultada
        if (solicitud.getObra() == null || solicitud.getObra().getEmpresaCliente() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("La solicitud consultada no tiene una obra o empresa válida asociada.");
        }
        
        // 2. Validar que el cliente en sesión tenga una empresa en su perfil
        if (principal.getEmpresa() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Tu usuario no tiene una empresa asignada para consultar esta información.");
        }
        
        // 3. Validar si la empresa del cliente coincide con la empresa de la obra
        Long idEmpresaObra = solicitud.getObra().getEmpresaCliente().getId();
        Long idEmpresaCliente = principal.getEmpresa().getId();
        
        if (!idEmpresaObra.equals(idEmpresaCliente)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("No tienes acceso a las solicitudes de obras pertenecientes a otras empresas.");
        }
    }
    
    return ResponseEntity.ok(solicitud);
}

    @GetMapping("/usuario/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLIENTE') and #id == authentication.principal.id)")
    public ResponseEntity<List<Solicitud>> obtenerPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudService.obtenerPorUsuario(id));
    }

    @GetMapping("/obra/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLIENTE') and @obraService.findById(#id).empresaCliente.id == authentication.principal.empresa.id)")
    public ResponseEntity<List<Solicitud>> obtenerPorObra(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudService.obtenerPorObra(id));
    }

    @PostMapping
    public ResponseEntity<Solicitud> crear(@RequestBody Solicitud solicitud) {
        Solicitud nuevaSolicitud = solicitudService.guardar(solicitud);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaSolicitud);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Solicitud> actualizar(@PathVariable Long id, @RequestBody Solicitud detalles) {
        return ResponseEntity.ok(solicitudService.update(id, detalles));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        solicitudService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/calificar")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<?> calificar(@PathVariable Long id, @RequestBody Map<String, Integer> body, @AuthenticationPrincipal Usuario principal) {
        Integer estrellas = body.get("estrellas");
        Solicitud solicitud = solicitudService.obtenerPorId(id);
        
       // 1. Validar que la solicitud tenga una obra y una empresa asociada
    if (solicitud.getObra() == null || solicitud.getObra().getEmpresaCliente() == null) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("La solicitud no tiene una obra o empresa válida asociada.");
    }
    
    // 2. Validar que el usuario actual tenga una empresa asignada en su perfil
    if (principal.getEmpresa() == null) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tu usuario no tiene una empresa asignada para realizar esta acción.");
    }
    
    // 3. Validar si la empresa del cliente coincide con la empresa de la obra de la solicitud
    Long idEmpresaObra = solicitud.getObra().getEmpresaCliente().getId();
    Long idEmpresaCliente = principal.getEmpresa().getId();
    
    if (!idEmpresaObra.equals(idEmpresaCliente)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Solo los usuarios de la empresa contratante de esta obra pueden calificar la solicitud.");
    }
    
    // 4. Si pasa las validaciones, se registra la calificación
    Solicitud solicitudCalificada = solicitudService.registrarCalificacion(id, estrellas);
    return ResponseEntity.ok(solicitudCalificada);
    }
}