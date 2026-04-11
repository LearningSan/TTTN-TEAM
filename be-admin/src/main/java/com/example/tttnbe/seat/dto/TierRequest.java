package com.example.tttnbe.seat.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class TierRequest {
    private UUID tierId;
    private String tierName;
    private BigDecimal price;
    private String currency;
    private String colorCode;
    private String description;
    private Integer displayOrder;

    // Các thông số để "đẻ" ghế cho Hạng này
    private String rowPrefix;
    private Integer rowCount;
    private Integer seatsPerRow;
}
