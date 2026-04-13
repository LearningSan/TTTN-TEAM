package com.example.tttnbe.order.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class OrderDetailResponse {
    private UUID orderId;
    private String orderStatus;
    private BigDecimal totalAmount;
    private String currency;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime paidAt;
    private String note;

    // Thông tin khách hàng
    private UUID userId;
    private String userName;
    private String userEmail;

    // Thông tin sự kiện
    private String concertTitle;
    private String venueName;

    // Danh sách các vé trong đơn hàng này
    private List<OrderItemDetailResponse> items;
}