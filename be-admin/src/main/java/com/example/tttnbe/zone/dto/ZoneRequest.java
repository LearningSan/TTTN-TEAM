package com.example.tttnbe.zone.dto;

import com.example.tttnbe.seat.dto.TierRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class ZoneRequest {

    // zoneId có thể null khi Admin tạo mới (do DB tự sinh), nên KHÔNG cần @NotNull ở đây
    private UUID zoneId;

    @NotBlank(message = "Tên khu vực (Zone) không được để trống")
    private String zoneName;

    @NotNull(message = "Giá vé khu vực không được để trống")
    @Min(value = 0, message = "Giá vé khu vực không được là số âm")
    private BigDecimal price;

    // Đối với khu vực đứng (không có map), số ghế bắt buộc phải nhập và lớn hơn 0
    @Min(value = 1, message = "Tổng số ghế của khu vực tối thiểu phải là 1")
    private Integer totalSeats;

    @NotBlank(message = "Loại tiền tệ không được để trống (VD: VND, USD)")
    private String currency;

    @NotBlank(message = "Mã màu hiển thị không được để trống")
    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Mã màu phải đúng định dạng HEX (VD: #FF0000)")
    private String colorCode;

    @NotNull(message = "Vui lòng xác định khu vực này có sơ đồ ghế hay không (true/false)")
    private Boolean hasSeatMap;

    @NotNull(message = "Thứ tự hiển thị không được để trống")
    @Min(value = 1, message = "Thứ tự hiển thị phải từ 1 trở lên")
    private Integer displayOrder;

    @Valid // 👈 Tiếp tục "truyền lửa", ra lệnh cho Spring Boot chui xuống kiểm tra tiếp TierRequest
    private List<TierRequest> tiers;
}