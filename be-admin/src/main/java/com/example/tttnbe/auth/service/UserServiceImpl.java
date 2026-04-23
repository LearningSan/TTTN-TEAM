package com.example.tttnbe.auth.service;

import com.example.tttnbe.auth.dto.UserResponse;
import com.example.tttnbe.auth.entity.User;
import com.example.tttnbe.auth.repository.UserRepository;
import com.example.tttnbe.common.exception.CustomException;
import com.example.tttnbe.common.response.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserServiceImpl implements UserService{
    @Autowired
    private UserRepository userRepository;

    // 1. Lấy danh sách người dùng (Có tìm kiếm và phân trang)
    public PageResponse<UserResponse> getAllUsers(int page, int size, String keyword, String status) {
        int currentPage = (page > 0) ? page - 1 : 0;
        Pageable pageable = PageRequest.of(currentPage, size, Sort.by("createdAt").descending());

        Page<User> usersPage = userRepository.searchUsers(keyword, status, pageable);

        Page<UserResponse> dtoPage = usersPage.map(user -> UserResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build());

        return PageResponse.from(dtoPage);
    }

    // 2. Thay đổi trạng thái tài khoản (Ban / Unban)
    public UserResponse changeUserStatus(UUID targetUserId, String newStatus) {

        // Kiểm tra xem trạng thái truyền lên có hợp lệ không
        if (!newStatus.equals("ACTIVE") && !newStatus.equals("LOCKED")) {
            throw new CustomException(400, "Trạng thái không hợp lệ. Chỉ chấp nhận ACTIVE hoặc BANNED");
        }

        // Tìm User cần trảm
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng này"));

        // Lấy ID của Admin đang thực hiện thao tác này
        String currentAdminId = SecurityContextHolder.getContext().getAuthentication().getName();

        // LUẬT THÉP: Không được tự khóa chính mình
        if (targetUser.getUserId().toString().equals(currentAdminId)) {
            throw new CustomException(400, "Bạn không thể tự khóa tài khoản của chính mình!");
        }

        // LUẬT THÉP: Không được khóa Admin khác
        if ("ROLE_ADMIN".equals(targetUser.getRole())) {
            throw new CustomException(403, "Bạn không có quyền khóa tài khoản của Quản trị viên khác!");
        }

        // Thực thi án phạt
        targetUser.setStatus(newStatus);
        User savedUser = userRepository.save(targetUser);

        return UserResponse.builder()
                .userId(savedUser.getUserId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .build();
    }
}
