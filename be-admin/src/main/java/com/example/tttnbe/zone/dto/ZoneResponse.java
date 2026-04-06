package com.example.tttnbe.zone.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@Getter
@Setter
public class ZoneResponse {
    private UUID zoneId;
    private String zoneName;
    private BigDecimal price;
    private String currency;
    private Integer totalSeats;
    private Integer availableSeats;
    private String colorCode;
    private Boolean hasSeatMap;
    private Integer displayOrder;
    private String rowPrefix;
    private Integer rowCount;
    private Integer seatsPerRow;
}
