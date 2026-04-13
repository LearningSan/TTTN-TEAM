package com.example.tttnbe.order.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class OrderResponse {
    private UUID orderId;
    private String userName;       // Cần biết ai mua
    private String userEmail;      // Email liên hệ
    private String concertTitle;   // Mua vé show nào
    private BigDecimal totalAmount;// Tổng tiền
    private String currency;
    private String orderStatus;    // Trạng thái đơn

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime createdAt;
}
