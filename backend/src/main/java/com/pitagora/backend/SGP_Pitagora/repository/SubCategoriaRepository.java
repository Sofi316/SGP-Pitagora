package com.pitagora.backend.SGP_Pitagora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pitagora.backend.SGP_Pitagora.model.SubCategoria;

@Repository
public interface SubCategoriaRepository extends JpaRepository<SubCategoria, Long>{

    List<SubCategoria> findByCategoriaId(Long idCategoria);
}
