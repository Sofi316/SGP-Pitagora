package com.pitagora.backend.SGP_Pitagora.controller;
import java.util.List;

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
    public List<Rol> getAll(){
        return rolService.findAll();
    }
    @GetMapping("/{id}")
    public Rol getById(@PathVariable Long id) {
        return rolService.findById(id);
    }
    @PostMapping
    public Rol create(@RequestBody Rol rol){
        return rolService.save(rol);
    }

    @PutMapping("/{id}")
    public Rol update(@PathVariable Long id, @RequestBody Rol rol){
        rol.setId(id);
        return rolService.save(rol);
       
    }





}
