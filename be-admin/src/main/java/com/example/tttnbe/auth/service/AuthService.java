package com.example.tttnbe.auth.service;

import com.example.tttnbe.auth.dto.LoginRequest;
import com.example.tttnbe.auth.dto.LoginResponse;
import com.example.tttnbe.auth.dto.LogoutRequest;
import com.example.tttnbe.auth.entity.RefreshToken;
import com.example.tttnbe.auth.entity.User;
import com.example.tttnbe.common.exception.CustomException;
import com.example.tttnbe.auth.repository.RefreshTokenRepository;
import com.example.tttnbe.auth.repository.UserRepository;
import com.example.tttnbe.auth.security.JwtTokenProvider;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;  //dung BCryptPasswordEncoder
    private final JwtTokenProvider jwtProvider; //class tao JWT

    // Constructor Injection
    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider jwtProvider) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    @Transactional
    public LoginResponse loginAdmin(LoginRequest request, String ipAddress, String deviceInfo) {

        //tim user theo email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(HttpStatus.UNAUTHORIZED.value(), "Sai email hoặc mật khẩu"));

        //kiem tra role
        if (!"ADMIN".equals(user.getRole())) {
            throw new CustomException(HttpStatus.FORBIDDEN.value(), "Bạn không có quyền truy cập hệ thống này!");
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new CustomException(HttpStatus.FORBIDDEN.value(), "Tài khoản Admin đã bị khóa hoặc chưa kích hoạt!");
        }

        //kiem tra mat khau
        //ham matches() cua BCrypt se tu dong so sanh theo ma hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new CustomException(HttpStatus.UNAUTHORIZED.value(), "Sai email hoặc mật khẩu");
        }

        //tao token neu moi thu hop le
        //tao access token
        String accessToken = jwtProvider.generateAccessToken(user.getUserId(), user.getRole());

        //tao refresh token
        String rawRefreshToken = UUID.randomUUID().toString();

        //luu rf token vao db
        RefreshToken tokenEntity = new RefreshToken();
        tokenEntity.setUserId(user.getUserId());
        //bam token truoc khi luu
        tokenEntity.setTokenHash(passwordEncoder.encode(rawRefreshToken));
        tokenEntity.setIpAddress(ipAddress);
        tokenEntity.setDeviceInfo(deviceInfo);
        tokenEntity.setExpiresAt(LocalDateTime.now().plusDays(7));
        tokenEntity.setCreatedAt(LocalDateTime.now());

        refreshTokenRepository.save(tokenEntity);

        //tra ket qua cho controller
        return new LoginResponse(accessToken, rawRefreshToken);
    }

    @Transactional
    public void logout(LogoutRequest request) {
        //tim refresh token dang luu cua user nay
        List<RefreshToken> tokens = refreshTokenRepository.findByUserId(request.getUserId());

        //duyet
        for (RefreshToken token : tokens) {
            if (passwordEncoder.matches(request.getRefreshToken(), token.getTokenHash())) {
                //xoa
                refreshTokenRepository.delete(token);
                return;
            }
        }

        throw new CustomException(HttpStatus.UNAUTHORIZED.value(), "Token không hợp lệ hoặc đã bị đăng xuất!");
    }
}
