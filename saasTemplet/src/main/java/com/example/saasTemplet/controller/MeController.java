package com.example.saasTemplet.controller;

import com.example.saasTemplet.model.User;
import com.example.saasTemplet.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
public class MeController {

    private final UserService userService;

    @GetMapping
    public User getMe(@AuthenticationPrincipal Jwt jwt) {
        return userService.syncUser(jwt);
    }
}
