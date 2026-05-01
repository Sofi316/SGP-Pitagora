package com.pitagora.backend.SGP_Pitagora.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pitagora.backend.SGP_Pitagora.model.Region;
import com.pitagora.backend.SGP_Pitagora.service.RegionService;


@RestController
@RequestMapping("api/regiones")
public class RegionController {
    private final RegionService regionService;

    public RegionController (RegionService regionService){
        this.regionService = regionService;
    }
    @GetMapping
    public List<Region> getAll(){
        return regionService.findAll();
    }
    @GetMapping("/{id}")
    public Region getById(@PathVariable Long id) {
        return regionService.findById(id);
    }

    @PostMapping
    public Region create(@RequestBody Region region){
        return regionService.save(region);
    }

    @PutMapping("/{id}")
    public Region update(@PathVariable Long id, @RequestBody Region region){
        region.setId(id);
        return regionService.save(region);
    }

}
