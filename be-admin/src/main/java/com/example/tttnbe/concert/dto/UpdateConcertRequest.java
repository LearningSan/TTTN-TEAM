package com.example.tttnbe.concert.dto;

import com.example.tttnbe.zone.dto.ZoneRequest;
import com.fasterxml.jackson.annotation.JsonFormat; // 👈 NHỚ IMPORT CÁI NÀY
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateConcertRequest {
    private String title;
    private String artist;

    // 👇 Đã thêm giáp bảo vệ cho 4 biến ngày tháng
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime concertDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    private String description;
    private String bannerURL;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime saleStartAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime saleEndAt;

    private UUID venueId;
    private String status;

    private String layoutConfig;
    //cho admin tao zone trong khi tao concert moi
    private List<ZoneRequest> zones;
}