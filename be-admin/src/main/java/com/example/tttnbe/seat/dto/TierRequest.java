package com.example.tttnbe.seat.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class TierRequest {

    // Tương tự, tierId có thể null lúc tạo mới
    private UUID tierId;

    @NotBlank(message = "Tên hạng vé không được để trống")
    private String tierName;

    @NotNull(message = "Giá vé hạng này không được để trống")
    @Min(value = 0, message = "Giá vé không được là số âm")
    private BigDecimal price;

    @NotBlank(message = "Loại tiền tệ không được để trống")
    private String currency;

    @NotBlank(message = "Mã màu hiển thị không được để trống")
    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Mã màu phải đúng định dạng HEX (VD: #FFD700)")
    private String colorCode;

    @NotBlank(message = "Mô tả hạng vé không được để trống")
    private String description;

    @NotNull(message = "Thứ tự hiển thị không được để trống")
    @Min(value = 1, message = "Thứ tự hiển thị phải từ 1 trở lên")
    private Integer displayOrder;

    // ==========================================
    // THÔNG SỐ ĐẺ GHẾ (SEAT GENERATION)
    // ==========================================

    @Pattern(regexp = "^[A-Z]{1,2}$", message = "Ký tự hàng ghế phải là 1-2 chữ cái in hoa (VD: A, B, AA)")
    private String rowPrefix;

    @Min(value = 1, message = "Số lượng hàng ghế tối thiểu phải là 1")
    private Integer rowCount;

    @Min(value = 1, message = "Số lượng ghế trên mỗi hàng tối thiểu phải là 1")
    private Integer seatsPerRow;
}