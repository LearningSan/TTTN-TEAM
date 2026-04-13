package com.example.tttnbe.concert.dto;

import com.example.tttnbe.zone.dto.ZoneResponse;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConcertResponse {
    private UUID concertId;
    private String title;
    private String artist;
    private String description;
    private String bannerURL;
    private String status;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime concertDate;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime endDate;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime saleStartAt;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime saleEndAt;

    private UUID organizerId;
    private String organizerName;

    private UUID venueId;
    private String venueName;

    private String layoutConfig;

    private List<ZoneResponse> zones;
}
