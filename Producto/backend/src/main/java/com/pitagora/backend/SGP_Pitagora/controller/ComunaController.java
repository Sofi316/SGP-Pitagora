package com.pitagora.backend.SGP_Pitagora.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pitagora.backend.SGP_Pitagora.model.Comuna;
import com.pitagora.backend.SGP_Pitagora.service.ComunaService;



@RestController
@RequestMapping("/api/comunas")
public class ComunaController {
    private final ComunaService comunaService;
    public ComunaController (ComunaService comunaService){
        this.comunaService = comunaService;
    }
    @GetMapping
    public List<Comuna> getAll(){
       return comunaService.findAll();
    }
    @GetMapping("/{id}")
    public Comuna getById(@PathVariable Long id) {
        return comunaService.findById(id);
    }
    @GetMapping("/region/{id}")
    public List<Comuna> getByRegion(@PathVariable Long id) {
        return comunaService.listarPorRegion(id);
    }

    @PostMapping
    public Comuna create(@RequestBody Comuna comuna) {
        return comunaService.save(comuna);
    }

    @PutMapping("/{id}")
    public Comuna update(@PathVariable Long id, @RequestBody Comuna comuna) {
        comuna.setId(id);
        return comunaService.save(comuna);
    }

}
