package com.example.tttnbe.venue.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VenueResponse {
    private UUID venueId;
    private String venueName;
}
