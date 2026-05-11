package com.pitagora.backend.SGP_Pitagora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pitagora.backend.SGP_Pitagora.model.EstadoSolicitud;
@Repository
public interface EstadoSolicitudRepository extends JpaRepository<EstadoSolicitud,Long>{

}
