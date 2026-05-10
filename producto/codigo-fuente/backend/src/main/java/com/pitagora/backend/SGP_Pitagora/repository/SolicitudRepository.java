package com.pitagora.backend.SGP_Pitagora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pitagora.backend.SGP_Pitagora.model.Solicitud;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {
    
    @Query("SELECT s FROM Solicitud s " +
           "JOIN FETCH s.estadoSolicitud " +
           "JOIN FETCH s.subCategoria sub " +
           "JOIN FETCH sub.categoria " +
           "JOIN FETCH s.usuario u " +
           "JOIN FETCH u.rol " +
           "JOIN FETCH s.obra o " +
           "JOIN FETCH o.empresaCliente " +
           "JOIN FETCH o.comuna c " +            
           "JOIN FETCH c.region")               
    List<Solicitud> findAllConDetalles();
    
    @Query("SELECT s FROM Solicitud s " +
           "JOIN FETCH s.estadoSolicitud " +
           "JOIN FETCH s.subCategoria sub " +
           "JOIN FETCH sub.categoria " +
           "JOIN FETCH s.usuario u " +
           "JOIN FETCH u.rol " +
           "JOIN FETCH s.obra o " +
           "JOIN FETCH o.empresaCliente " +
           "JOIN FETCH o.comuna c " +
           "JOIN FETCH c.region " +
           "WHERE u.id = :id")
    List<Solicitud> findByUsuarioIdConDetalles(@Param("id") Long id);

    @Query("SELECT s FROM Solicitud s " +
           "JOIN FETCH s.estadoSolicitud " +
           "JOIN FETCH s.subCategoria sub " +
           "JOIN FETCH sub.categoria " +
           "JOIN FETCH s.usuario u " +
           "JOIN FETCH u.rol " +
           "JOIN FETCH s.obra o " +
           "JOIN FETCH o.empresaCliente " +
           "JOIN FETCH o.comuna c " +
           "JOIN FETCH c.region " +
           "WHERE o.id = :id")
    List<Solicitud> findByObraIdConDetalles(@Param("id") Long id);

    @Query("SELECT s FROM Solicitud s " +
           "JOIN FETCH s.estadoSolicitud " +
           "JOIN FETCH s.subCategoria sub " +
           "JOIN FETCH sub.categoria " +
           "JOIN FETCH s.usuario u " +
           "JOIN FETCH u.rol " +
           "JOIN FETCH s.obra o " +
           "JOIN FETCH o.empresaCliente " +
           "JOIN FETCH o.comuna c " +
           "JOIN FETCH c.region " +
           "WHERE s.estadoSolicitud.id = :id")
    List<Solicitud> findByEstadoSolicitudIdConDetalles(@Param("id") Long id);
}