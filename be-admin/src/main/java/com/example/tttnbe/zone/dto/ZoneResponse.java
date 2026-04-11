package com.example.tttnbe.zone.dto;

import com.example.tttnbe.seat.dto.TierResponse;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
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

    private List<TierResponse> tiers;
}
