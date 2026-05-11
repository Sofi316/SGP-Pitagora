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

    public EmpresaCliente findById(Long id) {
        return empresaClienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa no encontrada"));
    }

    public EmpresaCliente save(EmpresaCliente empresa) {
        String rutLimpio = empresa.getRut().trim().toUpperCase();
        Optional<EmpresaCliente> existente = empresaClienteRepository.findByRut(rutLimpio);

        if (existente.isPresent()) {
            EmpresaCliente empBD = existente.get();
            if (empBD.getActivo()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe una empresa registrada con ese RUT");
            } else {
                empBD.setActivo(true);
                empBD.setRazonSocial(empresa.getRazonSocial().trim());
                return empresaClienteRepository.save(empBD);
            }
        }

        empresa.setRut(rutLimpio);
        empresa.setRazonSocial(empresa.getRazonSocial().trim());
        empresa.setActivo(true);
        return empresaClienteRepository.save(empresa);
    }

    public EmpresaCliente update(Long id, EmpresaCliente empresaModificada) {
        EmpresaCliente empresaAntigua = empresaClienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa no encontrada"));
        
        String nuevoRut = empresaModificada.getRut().trim().toUpperCase();

        Optional<EmpresaCliente> existente = empresaClienteRepository.findByRut(nuevoRut);
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El RUT ingresado ya pertenece a otra empresa");
        }

        empresaAntigua.setRut(nuevoRut);
        empresaAntigua.setRazonSocial(empresaModificada.getRazonSocial().trim());

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
