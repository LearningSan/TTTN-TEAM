package com.example.tttnbe.venue.service;

import com.example.tttnbe.venue.dto.VenueResponse;
import com.example.tttnbe.venue.entity.Venue;
import com.example.tttnbe.venue.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VenueServiceImpl implements VenueService{
    @Autowired
    private VenueRepository venueRepository;

    //1 - getAll khong phan trang
    public List<VenueResponse> getVenues(){
        List<Venue> venues = venueRepository.findAll();

        return venues.stream()
                .map(venue -> new VenueResponse(
                        venue.getVenueId(),
                        venue.getVenueName()
                ))
                .collect(Collectors.toList());
    }
}
