package com.example.tttnbe.auth.controller;

import com.example.tttnbe.auth.dto.UserResponse;
import com.example.tttnbe.auth.repository.UserRepository;
import com.example.tttnbe.auth.service.UserService;
import com.example.tttnbe.common.response.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/users")
public class UserController {
    @Autowired
    private UserService userService;

    // API 1: Xem danh sách và Tìm kiếm người dùng
    @GetMapping
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {

        PageResponse<UserResponse> response = userService.getAllUsers(page, size, keyword, status);
        return ResponseEntity.ok(response);
    }

    // API 2: Khóa (Ban) hoặc Mở khóa (Active) tài khoản
    @PutMapping("/{id}/status")
    public ResponseEntity<UserResponse> changeUserStatus(
            @PathVariable UUID id,
            @RequestParam String newStatus) {

        UserResponse response = userService.changeUserStatus(id, newStatus.toUpperCase());
        return ResponseEntity.ok(response);
    }
}
