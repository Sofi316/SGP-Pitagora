package com.pitagora.backend.SGP_Pitagora.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    private static final String BUCKET_ACTAS = "acta_entrega";
    private static final String BUCKET_EVIDENCIAS = "archivo_evidencia";

    public String uploadActa(MultipartFile file) {
        return uploadFileToBucket(file, BUCKET_ACTAS);
    }

    public String uploadEvidencia(MultipartFile file) {
        return uploadFileToBucket(file, BUCKET_EVIDENCIAS);
    }

    private String uploadFileToBucket(MultipartFile file, String bucketName) {
        try {
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");
            String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filename;

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(supabaseKey);
            headers.setContentType(MediaType.valueOf(file.getContentType() != null ? file.getContentType() : "application/octet-stream"));

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
            
            restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

            return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + filename;
            
        } catch (Exception e) {
            throw new RuntimeException("Error al subir archivo a Supabase: " + e.getMessage());
        }
    }
}