package com.example.tttnbe.zone.controller;

import com.example.tttnbe.seat.entity.Seat;
import com.example.tttnbe.seat.repository.SeatRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/zones")
public class SeatController {
    private SeatRepository seatRepository;

    @GetMapping("/{zoneId}/seats")
    public ResponseEntity<?> getSeatsByZone(@PathVariable UUID zoneId) {
        // Có thể gọi qua Service, ở đây mình viết gọn
        List<Seat> seats = seatRepository.findByZone_ZoneIdOrderByRowLabelAscSeatNumberAsc(zoneId);

        // Bạn nên map sang SeatResponse để giấu đi các trường không cần thiết
        return ResponseEntity.ok(seats);
    }
}
