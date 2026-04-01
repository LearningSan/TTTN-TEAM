package com.example.tttnbe.venue.service;

import com.example.tttnbe.venue.dto.VenueResponse;
import com.example.tttnbe.venue.entity.Venue;

import java.util.List;

public interface VenueService {
    public List<VenueResponse> getVenues();
}
