package com.pitagora.backend.SGP_Pitagora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pitagora.backend.SGP_Pitagora.model.EmpresaCliente;

@Repository
public interface EmpresaClienteRepository extends JpaRepository<EmpresaCliente, Long>{
    
    Optional<EmpresaCliente> findByRut(String rut);
    List<EmpresaCliente> findByActivoTrue();
}