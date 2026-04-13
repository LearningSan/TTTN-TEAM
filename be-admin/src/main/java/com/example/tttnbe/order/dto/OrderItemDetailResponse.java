package com.example.tttnbe.order.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class OrderItemDetailResponse {
    private UUID orderItemId;
    private String zoneName;
    private String tierName;
    private String seatLabel; // Sẽ là null nếu là vé đứng
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
}
