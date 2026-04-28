package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import com.pitagora.backend.SGP_Pitagora.model.ArchivoEvidencia;
import com.pitagora.backend.SGP_Pitagora.repository.ArchivoEvidenciaRepository;

@Service
public class ArchivoEvidenciaService {

    private final ArchivoEvidenciaRepository archivoEvidenciaRepository;

    public ArchivoEvidenciaService(ArchivoEvidenciaRepository archivoEvidenciaRepository) {
        this.archivoEvidenciaRepository = archivoEvidenciaRepository;
    }

    public List<ArchivoEvidencia> obtenerTodos() {
        return archivoEvidenciaRepository.findAll();
    }

    public Optional<ArchivoEvidencia> obtenerPorId(Long id) {
        return archivoEvidenciaRepository.findById(id);
    }

    public List<ArchivoEvidencia> obtenerPorSolicitud(Long idSolicitud) {
        return archivoEvidenciaRepository.findBySolicitudId(idSolicitud);
    }

    public ArchivoEvidencia guardar(ArchivoEvidencia archivoEvidencia) {
        return archivoEvidenciaRepository.save(archivoEvidencia);
    }

    public ArchivoEvidencia update(Long id, ArchivoEvidencia archivoModificado) {
        // Optional envuelve el resultado en una caja, si el archivo no existe, no devuelve null, 
        // devuelve una caja vacía
        Optional<ArchivoEvidencia> archivoExistente = archivoEvidenciaRepository.findById(id);

        // este if le pregunta a la caja si tiene algo adentro
        if (archivoExistente.isPresent()){
            // utilizamos get para sacar el objeto de la caja para trabajar con él
            ArchivoEvidencia archivoAEditar = archivoExistente.get();

            // tomamos el archivo original y solo sobreescribimos sus datos
            archivoAEditar.setRutaArchivo(archivoModificado.getRutaArchivo());
            archivoAEditar.setTipoEvidencia(archivoModificado.getTipoEvidencia());
            archivoAEditar.setSolicitud(archivoModificado.getSolicitud());

            // devolvemos el archivo modificado a spring para que haga el update en postgre
            return archivoEvidenciaRepository.save(archivoAEditar);

        } else {
            // si no existe la id se devuelve un null seguro, donde responseEntity responde
            return null;
        }
    }
}