package com.example.tttnbe.zone.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ZoneRequest {
    private String zoneName;
    private BigDecimal price;
    private String currency;
    private Integer totalSeats;
    private String colorCode;
    private Boolean hasSeatMap;
    private Integer displayOrder;
}
