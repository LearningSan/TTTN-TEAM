package com.example.tttnbe.auth.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID userId;
    private String name;
    private String email;
    private String role; // Ví dụ: ROLE_USER, ROLE_ADMIN
    private String status; // Ví dụ: ACTIVE, BANNED, INACTIVE

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime createdAt;
}
