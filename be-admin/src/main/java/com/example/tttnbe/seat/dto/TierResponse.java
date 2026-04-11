package com.example.tttnbe.seat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TierResponse {
    private UUID tierId;
    private String tierName;
    private BigDecimal price;
    private String currency;
    private String colorCode;
    private String description;
    private Integer displayOrder;

    private String rowPrefix;
    private Integer rowCount;
    private Integer seatsPerRow;

    private Integer totalSeats;
    private Integer availableSeats;
}