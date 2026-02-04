package com.example.saasTemplet.service;

import com.example.saasTemplet.model.SubscriptionStatus;
import com.example.saasTemplet.model.User;
import com.example.saasTemplet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PolarService {

    @Value("${polar.access-token}")
    private String polarAccessToken;

    @Value("${polar.webhook-secret}")
    private String webhookSecret;

    private final UserRepository userRepository;

    private static final String POLAR_API_URL = "https://api.polar.sh/v1";

    public String createCheckoutSession(User user, String priceId) {
        // 1. Ensure Polar Customer exists
        String polarCustomerId = user.getPolarCustomerId();
        if (polarCustomerId == null) {
            polarCustomerId = createPolarCustomer(user);
            user.setPolarCustomerId(polarCustomerId);
            userRepository.save(user);
        }

        // 2. Create Checkout Session
        String url = POLAR_API_URL + "/checkouts/custom/sessions";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(polarAccessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Body payload
        Map<String, Object> body = Map.of(
                "customer_id", polarCustomerId,
                "product_price_id", priceId, // Ensure this ID is valid in Polar
                "success_url", "http://localhost:3000/home?success=true");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            // Real Call to Polar API
            var response = new org.springframework.web.client.RestTemplate().postForEntity(url, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("url")) {
                return (String) response.getBody().get("url");
            } else {
                throw new RuntimeException("No URL in response");
            }

        } catch (Exception e) {
            log.error("Failed to create checkout session", e);
            throw new RuntimeException("Billing service unavailable: " + e.getMessage());
        }
    }

    private String createPolarCustomer(User user) {
        // Create Polar Customer
        String url = POLAR_API_URL + "/customers";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(polarAccessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Assuming user.getEmail() acts as a unique identifier or we send email
        Map<String, Object> body = Map.of(
                "email", user.getEmail(),
                "name", "User " + user.getId() // Customize as needed
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            var response = new org.springframework.web.client.RestTemplate().postForEntity(url, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("id")) {
                return (String) response.getBody().get("id");
            }
            throw new RuntimeException("No Customer ID in response");
        } catch (Exception e) {
            log.error("Failed to create polar customer", e);
            // Verify if customer already exists if status 409 or similar, but for now throw
            throw new RuntimeException("Billing service unavailable: " + e.getMessage());
        }
    }

    @Transactional
    public void handleWebhook(String payload, String signature, String eventType) {
        // Verify signature (HMAC)
        // verifySignature(payload, signature, webhookSecret);

        log.info("Processing webhook event: {}", eventType);

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(payload);

            if ("subscription.created".equals(eventType) || "subscription.updated".equals(eventType)) {

                // Polar payload structure for subscription events typically wraps data in
                // "data"
                // e.g. { "type": "...", "data": { "customer_id": "...", "status": "..." } }
                // or sometimes flat. Assuming standard webhook structure:
                com.fasterxml.jackson.databind.JsonNode data = root.has("data") ? root.get("data") : root;

                if (data.has("customer_id") && data.has("status")) {
                    String customerId = data.get("customer_id").asText();
                    String status = data.get("status").asText();

                    log.info("Updating subscription for customer {}: {}", customerId, status);

                    userRepository.findByPolarCustomerId(customerId).ifPresent(user -> {
                        user.setSubscriptionStatus(mapAppStatus(status));
                        userRepository.save(user);
                    });
                } else {
                    log.warn("Webhook payload missing customer_id or status");
                }
            }
        } catch (Exception e) {
            log.error("Error processing webhook payload", e);
        }
    }

    private SubscriptionStatus mapAppStatus(String polarStatus) {
        return switch (polarStatus) {
            case "active" -> SubscriptionStatus.ACTIVE;
            case "past_due" -> SubscriptionStatus.PAST_DUE;
            case "canceled" -> SubscriptionStatus.CANCELED;
            default -> SubscriptionStatus.NONE;
        };
    }
}
