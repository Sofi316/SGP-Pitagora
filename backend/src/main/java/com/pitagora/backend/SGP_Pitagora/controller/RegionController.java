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

import com.pitagora.backend.SGP_Pitagora.model.Region;
import com.pitagora.backend.SGP_Pitagora.service.RegionService;


@RestController
@RequestMapping("api/regiones")
@CrossOrigin(origins = "*")
public class RegionController {
    private final RegionService regionService;

    public RegionController (RegionService regionService){
        this.regionService = regionService;
    }
     @GetMapping
    public ResponseEntity<List<Region>> getAll(){
        return ResponseEntity.ok(regionService.findAll());
    }

    @PostMapping
    public ResponseEntity<Region> create(@RequestBody Region region){
        Region nuevaRegion = regionService.save(region);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaRegion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Region> update(@PathVariable Long id, @RequestBody Region region){
        Region regionActualizada = regionService.update(id, region);
        if (regionActualizada == null){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(regionActualizada);
    }

}
