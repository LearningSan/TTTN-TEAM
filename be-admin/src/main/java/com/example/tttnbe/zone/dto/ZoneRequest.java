package com.example.tttnbe.zone.dto;

import com.example.tttnbe.seat.dto.TierRequest;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class ZoneRequest {
    private UUID zoneId;
    private String zoneName;
    private BigDecimal price;
    private Integer totalSeats;
    private String currency;
    private String colorCode;
    private Boolean hasSeatMap;
    private Integer displayOrder;

    private List<TierRequest> tiers;
}
