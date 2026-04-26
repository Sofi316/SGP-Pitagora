package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.Obra;
import com.pitagora.backend.SGP_Pitagora.repository.ObraRepository;


@Service
public class ObraService {

    private final ObraRepository obraRepository;

    public ObraService(ObraRepository obraRepository) {
        this.obraRepository = obraRepository;
    }

    public List<Obra> findAllActivas() {
        return obraRepository.findByActivoTrue();
    }

    public List<Obra> listarPorEmpresa(Long idEmpresa) {
        return obraRepository.findByEmpresaClienteIdAndActivoTrue(idEmpresa);
    }

    public Optional<Obra> findById(Long id) {
        return obraRepository.findById(id);
    }

    public Obra save(Obra obra) {
        return obraRepository.save(obra);
    }

    public Obra update(Long id, Obra obraModificada) {
        Obra obraAntigua = obraRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Obra no encontrada"));

        obraAntigua.setNombre(obraModificada.getNombre());
        obraAntigua.setDireccion(obraModificada.getDireccion());
        obraAntigua.setFechaInicioPostventa(obraModificada.getFechaInicioPostventa());
        obraAntigua.setFechaCierrePostventa(obraModificada.getFechaCierrePostventa());
        obraAntigua.setRutaActaEntrega(obraModificada.getRutaActaEntrega());
        obraAntigua.setEmpresaCliente(obraModificada.getEmpresaCliente());

        return obraRepository.save(obraAntigua);
    }

    public boolean delete(Long id) {
        Obra obra = obraRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Obra no encontrada"));

        obra.setActivo(false);
        obraRepository.save(obra);
        return true;
    }
}
