package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.EmpresaCliente;
import com.pitagora.backend.SGP_Pitagora.model.Obra;
import com.pitagora.backend.SGP_Pitagora.repository.EmpresaClienteRepository;
import com.pitagora.backend.SGP_Pitagora.repository.ObraRepository;
import com.pitagora.backend.SGP_Pitagora.repository.SolicitudRepository;

@Service
public class EmpresaClienteService {

    private final EmpresaClienteRepository empresaClienteRepository;
    private final ObraRepository obraRepository;
    private final SolicitudRepository solicitudRepository; 

    public EmpresaClienteService(EmpresaClienteRepository empresaClienteRepository, ObraRepository obraRepository, SolicitudRepository solicitudRepository) {
        this.empresaClienteRepository = empresaClienteRepository;
        this.obraRepository = obraRepository;
        this.solicitudRepository = solicitudRepository;
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

    @Transactional 
    public boolean delete(Long id) {
        EmpresaCliente empresa = empresaClienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa no encontrada"));
        
        if (solicitudRepository.existsSolicitudesBloqueantesEnEmpresa(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "No se puede eliminar la empresa. Existen obras con solicitudes sin resolución.");
        }

        empresa.setActivo(false);
        empresaClienteRepository.save(empresa);

        List<Obra> obrasAsociadas = obraRepository.findByEmpresaClienteIdAndActivoTrue(id);
        
        for (Obra obra : obrasAsociadas) {
            obra.setActivo(false);
        }
        
        obraRepository.saveAll(obrasAsociadas);

        return true;
    }
}
