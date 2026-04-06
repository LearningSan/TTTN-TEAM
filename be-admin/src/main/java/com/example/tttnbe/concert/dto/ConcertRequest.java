package com.example.tttnbe.concert.dto;

import com.example.tttnbe.zone.dto.ZoneRequest;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
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
    private UUID venueId;
    private String status;
    //cho admin tao zone trong khi tao concert moi
    private List<ZoneRequest> zones;
}
