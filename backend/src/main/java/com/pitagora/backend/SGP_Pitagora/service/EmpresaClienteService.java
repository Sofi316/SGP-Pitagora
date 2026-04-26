package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.EmpresaCliente;
import com.pitagora.backend.SGP_Pitagora.repository.EmpresaClienteRepository;

@Service
public class EmpresaClienteService {

    private final EmpresaClienteRepository empresaClienteRepository;

    public EmpresaClienteService(EmpresaClienteRepository empresaClienteRepository) {
        this.empresaClienteRepository = empresaClienteRepository;
    }

    public List<EmpresaCliente> findAll() {
        return empresaClienteRepository.findAll();
    }

    public List<EmpresaCliente> findAllActivas() {
        return empresaClienteRepository.findByActivoTrue();
    }

    public Optional<EmpresaCliente> findById(Long id) {
        return empresaClienteRepository.findById(id);
    }

    public EmpresaCliente save(EmpresaCliente empresa) {
        return empresaClienteRepository.save(empresa);
    }

    public EmpresaCliente update(Long id, EmpresaCliente empresaModificada) {
        EmpresaCliente empresaAntigua = empresaClienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa no encontrada"));
        
        empresaAntigua.setRut(empresaModificada.getRut());
        empresaAntigua.setRazonSocial(empresaModificada.getRazonSocial());

        return empresaClienteRepository.save(empresaAntigua);
    }

    public boolean delete(Long id) {
        EmpresaCliente empresa = empresaClienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa no encontrada"));
        
        empresa.setActivo(false);
        empresaClienteRepository.save(empresa);
        return true;
    }
}
