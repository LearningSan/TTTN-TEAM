package com.example.tttnbe.service;

import com.example.tttnbe.dto.LoginRequest;
import com.example.tttnbe.dto.LoginResponse;
import com.example.tttnbe.dto.LogoutRequest;
import com.example.tttnbe.entity.RefreshToken;
import com.example.tttnbe.entity.User;
import com.example.tttnbe.exception.CustomException;
import com.example.tttnbe.repository.RefreshTokenRepository;
import com.example.tttnbe.repository.UserRepository;
import com.example.tttnbe.security.JwtTokenProvider;
import jakarta.transaction.Transactional;
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

        System.out.println("===> Email nhận được: " + request.getEmail());
        System.out.println("===> Pass nhận được: " + request.getPassword());

        // Bước 1 & 2: Tìm User theo email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("Sai email hoặc mật khẩu"));

        // Mẹo: Không báo "Email không tồn tại" để hacker không dò được email

        // Bước 3: Kiểm tra Quyền (Role) và Trạng thái (Status)
        if (!"ADMIN".equals(user.getRole())) {
            throw new CustomException("Bạn không có quyền truy cập hệ thống này!");
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new CustomException("Tài khoản Admin đã bị khóa hoặc chưa kích hoạt!");
        }

        // Bước 4: Kiểm tra Mật khẩu (So sánh password nhập vào với password_hash trong DB)
        // Hàm matches() của BCrypt sẽ tự động làm phép toán so sánh mã Hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new CustomException("Sai email hoặc mật khẩu");
        }

        // Bước 5: Tạo Token nếu mọi thứ hợp lệ
        // 5.1 - Tạo Access Token (Sống ngắn: 15-30 phút)
        String accessToken = jwtProvider.generateAccessToken(user.getUserId(), user.getRole());

        // 5.2 - Tạo Refresh Token (Sống dài: 7 ngày) - Đây là chuỗi ngẫu nhiên gửi về cho Client
        String rawRefreshToken = UUID.randomUUID().toString();

        // 5.3 - Lưu mã Băm (Hash) của Refresh Token vào Database
        RefreshToken tokenEntity = new RefreshToken();
        tokenEntity.setUserId(user.getUserId());
        // Băm token trước khi lưu y như bảo mật mật khẩu!
        tokenEntity.setTokenHash(passwordEncoder.encode(rawRefreshToken));
        tokenEntity.setIpAddress(ipAddress);
        tokenEntity.setDeviceInfo(deviceInfo);
        tokenEntity.setExpiresAt(LocalDateTime.now().plusDays(7));
        tokenEntity.setCreatedAt(LocalDateTime.now());

        refreshTokenRepository.save(tokenEntity);

        // Trả kết quả về cho Controller
        return new LoginResponse(accessToken, rawRefreshToken);
    }

    @Transactional
    public void logout(LogoutRequest request) {
        // 1. Tìm tất cả Refresh Token đang lưu của User này
        List<RefreshToken> tokens = refreshTokenRepository.findByUserId(request.getUserId());

        // 2. Duyệt qua từng token để tìm cái khớp với token gửi lên
        for (RefreshToken token : tokens) {
            // Dùng hàm matches() y hệt như check Mật khẩu!
            if (passwordEncoder.matches(request.getRefreshToken(), token.getTokenHash())) {
                // 3. Nếu tìm thấy -> Xóa khỏi Database luôn cho sạch
                refreshTokenRepository.delete(token);
                return; // Xóa xong thì thoát hàm
            }
        }

        // Nếu chạy hết vòng lặp mà không thấy (có thể đã đăng xuất rồi hoặc token giả)
        // thì mình ném lỗi hoặc cứ để im cũng được. Ở đây mình ném lỗi cho rõ ràng:
        throw new CustomException("Token không hợp lệ hoặc đã bị đăng xuất!");
    }
}
