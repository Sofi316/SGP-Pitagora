package com.pitagora.backend.SGP_Pitagora.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pitagora.backend.SGP_Pitagora.model.SubCategoria;
import com.pitagora.backend.SGP_Pitagora.service.SubCategoriaService;

@RestController
@RequestMapping("/api/subcategorias")
public class SubCategoriaController {

    private final SubCategoriaService subCategoriaService;

    public SubCategoriaController(SubCategoriaService subCategoriaService) {
        this.subCategoriaService = subCategoriaService;
    }

    @GetMapping
    public ResponseEntity<List<SubCategoria>> getAll() {
        return ResponseEntity.ok(subCategoriaService.findAllActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubCategoria> getById(@PathVariable Long id) {
        return ResponseEntity.ok(subCategoriaService.findById(id));
    }

    @GetMapping("/categoria/{id}")
    public ResponseEntity<List<SubCategoria>> getByCategoria(@PathVariable Long id) {
        List<SubCategoria> subCategorias = subCategoriaService.listarPorCategoria(id);
        if (subCategorias.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(subCategorias);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SubCategoria subCategoria) {
        if (subCategoria.getCategoria() == null || subCategoria.getCategoria().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: La subcategoría debe estar vinculada a una categoría padre válida.");
        }

        SubCategoria nuevaSubCategoria = subCategoriaService.save(subCategoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaSubCategoria);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody SubCategoria subCategoria) {
        if (subCategoria.getCategoria() == null || subCategoria.getCategoria().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: La subcategoría debe mantener una categoría padre válida.");
        }

        SubCategoria subCategoriaActualizada = subCategoriaService.update(id, subCategoria);
        return ResponseEntity.ok(subCategoriaActualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subCategoriaService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
