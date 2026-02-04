package com.example.saasTemplet.repository;

import com.example.saasTemplet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByAuth0UserId(String auth0UserId);

    Optional<User> findByEmail(String email);

    Optional<User> findByPolarCustomerId(String polarCustomerId);
}
