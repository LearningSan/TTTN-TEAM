package com.example.tttnbe.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
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

    //ham phat Access Token
    public String generateAccessToken(UUID userId, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION);

        return Jwts.builder()
                .subject(userId.toString()) //luu id ng dung vao token
                .claim("role", role)        //luu quyen vao token
                .issuedAt(now)              //thoi diem tao
                .expiration(expiryDate)     //thoi diem het han
                .signWith(getSigningKey())  //ky bang chia khoa bi mat
                .compact();                 //dong goi thanh chuoi String
    }

    // 1. Hàm kiểm tra token có hợp lệ không
    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            System.out.println("Token không hợp lệ hoặc đã hết hạn: " + ex.getMessage());
            return false;
        }
    }

    // 2. Hàm lấy User ID từ token
    public String getUserIdFromJWT(String token) {
        Claims claims = Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
        return claims.getSubject();
    }

    // 3. Hàm lấy Role từ token
    public String getRoleFromJWT(String token) {
        Claims claims = Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
        return claims.get("role", String.class);
    }
}
