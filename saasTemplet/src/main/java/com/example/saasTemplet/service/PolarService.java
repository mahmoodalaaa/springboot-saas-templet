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
        log.info("Creating checkout session for user {} with priceId {}", user.getEmail(), priceId);

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
            log.error("Polar create customer response missing ID: {}", response.getBody());
            throw new RuntimeException("No Customer ID in response");
        } catch (org.springframework.web.client.HttpClientErrorException.Conflict e) {
            log.info("Customer already exists in Polar, fetching existing ID for email: {}", user.getEmail());
            return findPolarCustomerByEmail(user.getEmail());
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("Polar API error ({}): {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Billing service error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Failed to create polar customer", e);
            throw new RuntimeException("Billing service unavailable: " + e.getMessage());
        }
    }

    private String findPolarCustomerByEmail(String email) {
        String url = POLAR_API_URL + "/customers?email=" + email;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(polarAccessToken);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            var response = new org.springframework.web.client.RestTemplate().exchange(url,
                    org.springframework.http.HttpMethod.GET, entity, Map.class);
            var body = response.getBody();
            if (body != null && body.containsKey("items")) {
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> items = (java.util.List<Map<String, Object>>) body.get("items");
                if (!items.isEmpty()) {
                    return (String) items.get(0).get("id");
                }
            }
            throw new RuntimeException("Customer not found in Polar after conflict");
        } catch (Exception e) {
            log.error("Failed to find polar customer by email", e);
            throw new RuntimeException("Billing service unavailable during customer lookup: " + e.getMessage());
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

                    // Try to get plan name (product name)
                    String planName = null;
                    if (data.has("product") && data.get("product").has("name")) {
                        planName = data.get("product").get("name").asText();
                    }

                    log.info("Updating subscription for customer {}: {} (Plan: {})", customerId, status, planName);

                    final String finalPlanName = planName;
                    userRepository.findByPolarCustomerId(customerId).ifPresent(user -> {
                        user.setSubscriptionStatus(mapAppStatus(status));
                        if (finalPlanName != null) {
                            user.setPlan(finalPlanName);
                        }
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
