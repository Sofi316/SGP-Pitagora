/*package com.pitagora.backend.SGP_Pitagora.controller;

import com.pitagora.backend.SGP_Pitagora.dto.EmailWebhookDto;
import com.pitagora.backend.SGP_Pitagora.service.WebhookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/webhooks")
public class WebhookController {


@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private final WebhookService webhookService;

    public WebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping("/mail")
    public ResponseEntity<Void> receiveMail(@ModelAttribute EmailWebhookDto emailDto) {
        webhookService.procesarCorreoEntrante(emailDto);
        return ResponseEntity.ok().build();
    }
}

}
*/