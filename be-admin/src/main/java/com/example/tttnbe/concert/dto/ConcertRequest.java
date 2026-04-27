package com.example.tttnbe.concert.dto;

import com.example.tttnbe.zone.dto.ZoneRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class ConcertRequest {

    @NotBlank(message = "Tên sự kiện không được để trống hoặc chỉ chứa khoảng trắng")
    private String title;

    @NotBlank(message = "Tên nghệ sĩ không được để trống")
    private String artist;

    @NotNull(message = "Ngày giờ diễn ra sự kiện không được để trống")
    @Future(message = "Thời gian sự kiện phải diễn ra trong tương lai")
    private LocalDateTime concertDate;

    @Future(message = "Thời gian kết thúc sự kiện phải ở trong tương lai")
    private LocalDateTime endDate;

    private String description;
    private String bannerURL;

    @Future(message = "Thời gian mở bán vé phải ở trong tương lai")
    private LocalDateTime saleStartAt;

    @Future(message = "Thời gian đóng bán vé phải ở trong tương lai")
    private LocalDateTime saleEndAt;

    @NotNull(message = "Vui lòng chọn địa điểm tổ chức (Venue ID)")
    private UUID venueId;

    private String status;

    private String layoutConfig;

    @NotEmpty(message = "Concert phải có ít nhất 1 khu vực (Zone) để bán vé")
    @Valid // 👈 CỰC KỲ QUAN TRỌNG: Lệnh này yêu cầu Spring Boot "mở" cục ZoneRequest ra để kiểm tra tiếp các lỗi bên trong nó
    private List<ZoneRequest> zones;
}