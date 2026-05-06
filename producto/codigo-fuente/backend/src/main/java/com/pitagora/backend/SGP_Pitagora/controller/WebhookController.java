package com.pitagora.backend.SGP_Pitagora.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pitagora.backend.SGP_Pitagora.dto.EmailWebhookDto;
import com.pitagora.backend.SGP_Pitagora.service.WebhookService;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private final WebhookService webhookService;

    public WebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping(value = "/mail", consumes = "application/x-www-form-urlencoded")
    public ResponseEntity<Void> receiveMail(@ModelAttribute EmailWebhookDto emailDto) {
        webhookService.procesarCorreoEntrante(emailDto);
        return ResponseEntity.ok().build();
}
}