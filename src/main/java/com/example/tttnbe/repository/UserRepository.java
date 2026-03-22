package com.example.tttnbe.repository;

import com.example.tttnbe.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    //tim email cua user
    Optional<User> findByEmail(String email);
}
