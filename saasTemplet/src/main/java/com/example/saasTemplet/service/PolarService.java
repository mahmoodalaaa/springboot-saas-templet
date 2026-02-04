package com.example.saasTemplet.service;

import com.example.saasTemplet.model.SubscriptionStatus;
import com.example.saasTemplet.model.User;
import com.example.saasTemplet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

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
    private final RestTemplate restTemplate = new RestTemplate();

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
        String url = POLAR_API_URL + "/checkouts/custom/sessions"; // Verify endpoint from docs
        // Note: Actual endpoint might differ. Assuming standard checkout creation.
        // For Polar, it's often creating a checkout link or session.
        // Let's assume a generic implementation pattern or use a known endpoint.
        // Polar API: POST /v1/checkouts/custom/

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(polarAccessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Body payload
        Map<String, Object> body = Map.of(
                "customer_id", polarCustomerId,
                "product_price_id", priceId,
                "success_url", "http://localhost:3000/dashboard?success=true" // configure properly
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            // This is a placeholder call detailed implementation depends on exact Polar API
            // spec
            // ResponseEntity<Map> response = restTemplate.postForEntity(url, entity,
            // Map.class);
            // return (String) response.getBody().get("url");

            // To avoid unused warnings in this template:
            log.debug("Mocking call to {} with payload {}", url, entity);

            return "https://polar.sh/checkout/mock-session";
        } catch (Exception e) {
            log.error("Failed to create checkout session", e);
            throw new RuntimeException("Billing service unavailable");
        }
    }

    private String createPolarCustomer(User user) {
        // Implement customer creation logic
        log.info("Creating Polar customer for user {}", user.getId());
        // Call Polar API to create customer
        // Return ID
        return "polar_customer_" + user.getId();
    }

    @Transactional
    public void handleWebhook(String payload, String signature, String eventType) {
        // Verify signature (HMAC)
        // verifySignature(payload, signature, webhookSecret);

        log.info("Processing webhook event: {}", eventType);

        // Parse payload to find customer and subscription status
        // Example logic:
        if ("subscription.created".equals(eventType) || "subscription.updated".equals(eventType)) {
            // Extract customer ID and status
            String customerId = "extract_from_payload";
            String status = "active"; // map from payload

            userRepository.findByPolarCustomerId(customerId).ifPresent(user -> {
                user.setSubscriptionStatus(mapAppStatus(status));
                userRepository.save(user);
            });
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
