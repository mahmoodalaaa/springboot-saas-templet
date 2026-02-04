package com.example.saasTemplet.controller;

import com.example.saasTemplet.service.PolarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final PolarService polarService;

    @PostMapping("/polar")
    public ResponseEntity<Void> handlePolarWebhook(
            @RequestBody String payload,
            @RequestHeader("Polar-Signature") String signature,
            @RequestHeader(value = "Polar-Event", defaultValue = "unknown") String eventType) {

        polarService.handleWebhook(payload, signature, eventType);
        return ResponseEntity.ok().build();
    }
}
