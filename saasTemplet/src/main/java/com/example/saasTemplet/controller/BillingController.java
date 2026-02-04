package com.example.saasTemplet.controller;

import com.example.saasTemplet.service.PolarService;
import com.example.saasTemplet.model.User;
import com.example.saasTemplet.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
public class BillingController {

    private final PolarService polarService;
    private final UserService userService;

    @PostMapping("/checkout")
    public Map<String, String> createCheckoutSession(@AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, String> body) {
        User user = userService.syncUser(jwt);
        String priceId = body.get("priceId"); // Validate input
        String checkoutUrl = polarService.createCheckoutSession(user, priceId);
        return Map.of("url", checkoutUrl);
    }
}
