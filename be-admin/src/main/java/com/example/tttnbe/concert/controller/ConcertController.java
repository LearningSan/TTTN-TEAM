package com.example.tttnbe.concert.controller;

import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.concert.dto.ConcertRequest;
import com.example.tttnbe.concert.dto.ConcertResponse;
import com.example.tttnbe.concert.dto.UpdateConcertRequest;
import com.example.tttnbe.concert.service.ConcertService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/concerts")
public class ConcertController {
    @Autowired
    private ConcertService concertService;

    @PostMapping
    public ResponseEntity<ConcertResponse> createConcert(@Valid @RequestBody ConcertRequest concertRequest) {
        ConcertResponse createdConcert = concertService.createConcert(concertRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdConcert); //201
    }

    @GetMapping
    public ResponseEntity<PageResponse<ConcertResponse>> getAllConcerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(concertService.getAllConcerts(page, size)); //200
    }

    @GetMapping("/{concertId}")
    public ResponseEntity<ConcertResponse> getConcert(@PathVariable("concertId") UUID concertId) {
        return ResponseEntity.ok(concertService.getConcert(concertId)); //200
    }

    @PutMapping("/{concertId}")
    public ResponseEntity<ConcertResponse> updateConcert(
            @PathVariable("concertId") UUID concertId,
            @Valid @RequestBody UpdateConcertRequest concertRequest) {
        return ResponseEntity.ok(concertService.updateConcert(concertId, concertRequest)); //200
    }

    @DeleteMapping("/{concertId}")
    public ResponseEntity<Void> deleteConcert(@PathVariable("concertId") UUID concertId) {
        concertService.deleteConcert(concertId);
        return ResponseEntity.noContent().build(); //204: thanh cong, khong message
    }
}
