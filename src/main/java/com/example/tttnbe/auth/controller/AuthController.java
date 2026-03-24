package com.example.tttnbe.auth.controller;

import com.example.tttnbe.auth.dto.LoginRequest;
import com.example.tttnbe.auth.dto.LoginResponse;
import com.example.tttnbe.auth.dto.LogoutRequest;
import com.example.tttnbe.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/admin/login")
    public ResponseEntity<LoginResponse> loginAdmin(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        //Lay IP cua nguoi dung gui len
        String ipAddress = httpRequest.getRemoteAddr();
        //Lay thong tin cua thiet bi
        String deviceInfo = httpRequest.getHeader("User-Agent");

        //gọi ham tu service
        LoginResponse response = authService.loginAdmin(request, ipAddress, deviceInfo);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody LogoutRequest request) {
        authService.logout(request);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đăng xuất thành công! Tạm biệt sếp.");
        return ResponseEntity.ok(response);
    }
}
