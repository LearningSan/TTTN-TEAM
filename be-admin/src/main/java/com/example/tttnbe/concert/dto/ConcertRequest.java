package com.example.tttnbe.concert.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ConcertRequest {
    private String title;
    private String artist;
    private LocalDateTime concertDate;
    private LocalDateTime endDate;
    private String description;
    private String bannerURL;
    private LocalDateTime saleStartAt;
    private LocalDateTime saleEndAt;
    private String status;
    private UUID venueId;
}
