package com.pitagora.backend.SGP_Pitagora.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pitagora.backend.SGP_Pitagora.model.EmpresaCliente;
import com.pitagora.backend.SGP_Pitagora.service.EmpresaClienteService;

@RestController
@RequestMapping("/api/empresas-clientes")
@CrossOrigin(origins="*")
public class EmpresaClienteController {

    private final EmpresaClienteService empresaClienteService;
    
    public EmpresaClienteController(EmpresaClienteService empresaClienteService) {
        this.empresaClienteService = empresaClienteService;
    }
    @GetMapping
    public ResponseEntity<List<EmpresaCliente>> getAll() {
        return ResponseEntity.ok(empresaClienteService.findAllActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaCliente> getById(@PathVariable Long id) {
        return ResponseEntity.ok(empresaClienteService.findById(id));
    }

    @PostMapping
    public ResponseEntity<EmpresaCliente> create(@RequestBody EmpresaCliente empresa) {
        EmpresaCliente nuevaEmpresa = empresaClienteService.save(empresa);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEmpresa);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaCliente> update(@PathVariable Long id, @RequestBody EmpresaCliente empresa) {
        return ResponseEntity.ok(empresaClienteService.update(id, empresa));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        empresaClienteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
