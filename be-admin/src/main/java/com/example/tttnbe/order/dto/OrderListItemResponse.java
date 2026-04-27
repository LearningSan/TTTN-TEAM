package com.example.tttnbe.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record OrderListItemResponse(
        UUID orderId,
        String customerName,
        String customerEmail,
        BigDecimal totalAmount, // 👈 Phải khớp với kiểu dữ liệu trong Repository
        String currency,
        String orderStatus,
        LocalDateTime paidAt
) {}