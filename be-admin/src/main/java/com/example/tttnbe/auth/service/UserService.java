package com.example.tttnbe.auth.service;

import com.example.tttnbe.auth.dto.UserResponse;
import com.example.tttnbe.common.response.PageResponse;

import java.util.UUID;

public interface UserService{
    public PageResponse<UserResponse> getAllUsers(int page, int size, String keyword, String status);

    public UserResponse changeUserStatus(UUID targetUserId, String newStatus);
}
