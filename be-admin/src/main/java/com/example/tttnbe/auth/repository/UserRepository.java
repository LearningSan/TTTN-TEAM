package com.example.tttnbe.auth.repository;

import com.example.tttnbe.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    //tim user theo email
    Optional<User> findByEmail(String email);
}
