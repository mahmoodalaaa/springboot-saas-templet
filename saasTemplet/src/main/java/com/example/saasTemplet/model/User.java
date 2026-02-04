package com.example.saasTemplet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "auth0_user_id", unique = true, nullable = false)
    private String auth0UserId;

    @Column(nullable = false)
    private String email;

    private String firstName;

    private String lastName;

    @Column(name = "polar_customer_id")
    private String polarCustomerId;

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus subscriptionStatus;

    private String plan;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
