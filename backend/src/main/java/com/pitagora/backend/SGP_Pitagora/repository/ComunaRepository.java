package com.pitagora.backend.SGP_Pitagora.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pitagora.backend.SGP_Pitagora.model.Comuna;
public interface ComunaRepository extends JpaRepository <Comuna,Long>{

    List<Comuna> findByRegionId(Long regionId);

}
