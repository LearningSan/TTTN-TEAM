package com.example.tttnbe.venue.controller;

import com.example.tttnbe.venue.dto.VenueResponse;
import com.example.tttnbe.venue.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/venues")
public class VenueController {
    @Autowired
    private VenueService venueService;

    @GetMapping
    public ResponseEntity<List<VenueResponse>> getVenues() {
        return ResponseEntity.ok(venueService.getVenues());
    }
}
