package com.example.tttnbe.auth.repository;

import com.example.tttnbe.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    //tim tat ca token cua 1 user
    List<RefreshToken> findByUserId(UUID userId);
}