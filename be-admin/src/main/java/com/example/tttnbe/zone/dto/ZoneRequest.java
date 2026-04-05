package com.example.tttnbe.zone.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ZoneRequest {
    private String zoneName;
    private BigDecimal price;
    private String currency;
    private String colorCode;
    private Boolean hasSeatMap;
    private Integer displayOrder;
    private String rowPrefix;
    private Integer rowCount;
    private Integer seatsPerRow;
}
