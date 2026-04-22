package com.pitagora.backend.SGP_Pitagora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pitagora.backend.SGP_Pitagora.model.Obra;

@Repository
public interface ObraRepository extends JpaRepository<Obra, Long>{

    List<Obra> findByEmpresaClienteId(Long idEmpresaCliente);
}
