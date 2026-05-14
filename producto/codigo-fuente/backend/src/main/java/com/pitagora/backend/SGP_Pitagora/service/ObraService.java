package com.pitagora.backend.SGP_Pitagora.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pitagora.backend.SGP_Pitagora.model.Obra;
import com.pitagora.backend.SGP_Pitagora.repository.ObraRepository;
import com.pitagora.backend.SGP_Pitagora.repository.SolicitudRepository;


@Service
public class ObraService {

    private final ObraRepository obraRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final SolicitudRepository solicitudRepository;

    public ObraService(ObraRepository obraRepository, SupabaseStorageService supabaseStorageService, SolicitudRepository solicitudRepository) {
        this.obraRepository = obraRepository;
        this.supabaseStorageService = supabaseStorageService;
        this.solicitudRepository = solicitudRepository;
    }

    public List<Obra> findAllActivas() {
        return obraRepository.findByActivoTrue();
    }

    public List<Obra> listarPorEmpresa(Long id) {
        return obraRepository.findByEmpresaClienteIdAndActivoTrue(id);
    }

    public Obra findById(Long id) {
        return obraRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Obra no encontrada"));
    }

    public Obra save(Obra obra, MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            String urlActa = supabaseStorageService.uploadActa(file);
            obra.setRutaActaEntrega(urlActa);
        }
        return obraRepository.save(obra);
    }

    public Obra update(Long id, Obra obraModificada, MultipartFile file) {
        Obra obraAntigua = obraRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Obra no encontrada"));

        obraAntigua.setNombre(obraModificada.getNombre());
        obraAntigua.setDireccion(obraModificada.getDireccion());
        obraAntigua.setFechaInicioPostventa(obraModificada.getFechaInicioPostventa());
        obraAntigua.setFechaCierrePostventa(obraModificada.getFechaCierrePostventa());
        obraAntigua.setEmpresaCliente(obraModificada.getEmpresaCliente());
        obraAntigua.setComuna(obraModificada.getComuna());

        if (file != null && !file.isEmpty()) {
            String urlActa = supabaseStorageService.uploadActa(file);
            obraAntigua.setRutaActaEntrega(urlActa);
        }

        return obraRepository.save(obraAntigua);
    }

    public boolean delete(Long id) {
        Obra obra = obraRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Obra no encontrada"));

        if (solicitudRepository.existsSolicitudesBloqueantesEnObra(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "No se puede eliminar la obra. Existen solicitudes sin resolución.");
        }
        obra.setActivo(false);
        obraRepository.save(obra);
        return true;
    }
}