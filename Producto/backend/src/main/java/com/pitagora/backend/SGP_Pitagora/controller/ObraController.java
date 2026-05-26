package com.pitagora.backend.SGP_Pitagora.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pitagora.backend.SGP_Pitagora.model.Obra;
import com.pitagora.backend.SGP_Pitagora.model.Usuario;
import com.pitagora.backend.SGP_Pitagora.service.ObraService;

@RestController
@RequestMapping("/api/obras")
public class ObraController {

    private final ObraService obraService;

    public ObraController(ObraService obraService) {
        this.obraService = obraService;
    }

    @GetMapping
    public ResponseEntity<List<Obra>> getAll() {
        return ResponseEntity.ok(obraService.findAllActivas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')")
    public ResponseEntity<?> getById(@PathVariable Long id, @AuthenticationPrincipal Usuario principal) {
        Obra obra = obraService.findById(id);
        
        if (principal.getRol().getNombre().equals("CLIENTE")) {
            boolean tieneAcceso = principal.getObras().stream()
                    .anyMatch(o -> o.getId().equals(obra.getId()));
                    
            if (!tieneAcceso) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes permisos para ver esta obra.");
            }
        }
        return ResponseEntity.ok(obra);
    }

    @GetMapping("/empresa/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLIENTE') and authentication.principal.obras.![empresaCliente.id].contains(#id))")
    public ResponseEntity<List<Obra>> getByEmpresa(@PathVariable Long id) {
        List<Obra> obras = obraService.listarPorEmpresa(id);
        if (obras.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(obras);
    }

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> create(
            @RequestPart("obra") Obra obra,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        if (obra.getEmpresaCliente() == null || obra.getEmpresaCliente().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Debe asociar una empresa válida.");
        }
        Obra nuevaObra = obraService.save(obra, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaObra);
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<?> update(
            @PathVariable Long id, 
            @RequestPart("obra") Obra obra,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        if (obra.getEmpresaCliente() == null || obra.getEmpresaCliente().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("La obra debe mantener una empresa válida.");
        }
        return ResponseEntity.ok(obraService.update(id, obra, file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        obraService.delete(id);
        return ResponseEntity.noContent().build();
    }
}