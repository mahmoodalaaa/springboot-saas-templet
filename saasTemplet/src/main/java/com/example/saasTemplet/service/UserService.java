package com.example.saasTemplet.service;

import com.example.saasTemplet.model.SubscriptionStatus;
import com.example.saasTemplet.model.User;
import com.example.saasTemplet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User syncUser(Jwt jwt) {
        log.info("Syncing user with JWT claims: {}", jwt.getClaims());
        String auth0UserId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");

        Optional<User> existingUser = userRepository.findByAuth0UserId(auth0UserId);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            boolean updated = false;
            // Update email if changed
            if (email != null && !email.equals(user.getEmail())) {
                user.setEmail(email);
                updated = true;
            }
            // Update names if available and changed
            if (firstName != null && !firstName.equals(user.getFirstName())) {
                user.setFirstName(firstName);
                updated = true;
            }
            if (lastName != null && !lastName.equals(user.getLastName())) {
                user.setLastName(lastName);
                updated = true;
            }
            // Ensure existing users have a plan
            if (user.getPlan() == null) {
                user.setPlan("Free");
                updated = true;
            }

            if (updated) {
                log.info("Updating user info for: {}", auth0UserId);
                return userRepository.save(user);
            }
            return user;
        } else {
            log.info("Creating new user for: {}", auth0UserId);
            User newUser = User.builder()
                    .auth0UserId(auth0UserId)
                    .email(email != null ? email : "")
                    .firstName(firstName)
                    .lastName(lastName)
                    .plan("Free")
                    .subscriptionStatus(SubscriptionStatus.ACTIVE)
                    .build();
            return userRepository.save(newUser);
        }
    }

    public User getUser(String auth0UserId) {
        return userRepository.findByAuth0UserId(auth0UserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
