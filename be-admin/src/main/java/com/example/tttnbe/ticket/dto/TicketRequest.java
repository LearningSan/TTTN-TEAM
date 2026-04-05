package com.example.tttnbe.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TicketRequest {
    @NotBlank(message = "Địa chỉ ví không được để trống")
    private String walletAddress;

    @NotNull(message = "Thiếu ID người dùng")
    private UUID userId;

    @NotNull(message = "Thiếu ID Concert")
    private UUID concertId;

    @NotNull(message = "Thiếu ID Zone")
    private UUID zoneId;

    private UUID seatId;

    @NotNull(message = "Thiếu ID Đơn hàng")
    private UUID orderId;

    @NotNull(message = "Thiếu ID Chi tiết đơn hàng")
    private UUID orderItemId;

    @NotNull(message = "Thiếu ID Thanh toán")
    private UUID paymentId;
}
