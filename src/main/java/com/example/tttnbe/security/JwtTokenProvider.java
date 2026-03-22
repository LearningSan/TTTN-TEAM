package com.example.tttnbe.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {
    private final String JWT_SECRET = "emvietthiephongtenemthidungnhungtaisaosaitenanhaicattohongaigieotinhduyentanuavoi";

    //thoi gian song cua Access token: 1h
    private final long JWT_EXPIRATION = 3600000L;

    //ham tao key tu chuoi secret
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(JWT_SECRET.getBytes());
    }

    // Hàm xuất xưởng Access Token
    public String generateAccessToken(UUID userId, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION);

        return Jwts.builder()
                .subject(userId.toString()) // Lưu ID của người dùng vào token
                .claim("role", role)        // Lưu thêm quyền (ADMIN) vào token
                .issuedAt(now)              // Thời điểm tạo
                .expiration(expiryDate)     // Thời điểm hết hạn
                .signWith(getSigningKey())  // Ký bằng chìa khóa bí mật
                .compact();                 // Đóng gói thành chuỗi String
    }
}
