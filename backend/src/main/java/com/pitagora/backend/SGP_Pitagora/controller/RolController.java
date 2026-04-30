package com.pitagora.backend.SGP_Pitagora.controller;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pitagora.backend.SGP_Pitagora.model.Rol;
import com.pitagora.backend.SGP_Pitagora.service.RolService;

@RestController
@RequestMapping("api/roles")
@CrossOrigin(origins = "*")

public class RolController {
    private final RolService rolService;

    public RolController (RolService rolService){
        this.rolService = rolService;
    }

    @GetMapping
    public ResponseEntity<List<Rol>> getAll(){
        return ResponseEntity.ok(rolService.findAll());
    }
     @PostMapping
    public ResponseEntity<Rol> create(@RequestBody Rol rol){
        Rol nuevoRol = rolService.save(rol);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoRol);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Rol> update(@PathVariable Long id, @RequestBody Rol rol){
        Rol rolActualizado = rolService.update(id, rol);
        if (rolActualizado == null){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(rolActualizado);
    }





}
