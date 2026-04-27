package com.example.tttnbe.concert.controller;

import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.concert.dto.ConcertRequest;
import com.example.tttnbe.concert.dto.ConcertResponse;
import com.example.tttnbe.concert.dto.UpdateConcertRequest;
import com.example.tttnbe.concert.dto.UpdateStatusRequest;
import com.example.tttnbe.concert.service.ConcertService;
import com.example.tttnbe.ticket.dto.TicketListItemResponse;
import com.example.tttnbe.ticket.entity.Ticket;
import com.example.tttnbe.ticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/concerts")
public class ConcertController {
    @Autowired
    private ConcertService concertService;
    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<ConcertResponse> createConcert(@Valid @RequestBody ConcertRequest concertRequest) {
        ConcertResponse createdConcert = concertService.createConcert(concertRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdConcert); //201
    }

    @GetMapping
    public ResponseEntity<PageResponse<ConcertResponse>> getAllConcerts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID venueId,
            @RequestParam(required = false) String status) {

        PageResponse<ConcertResponse> response = concertService.getAllConcerts(page, size, keyword, venueId, status);
        return ResponseEntity.ok(response);
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

    @PatchMapping("/{concertId}/status")
    public ResponseEntity<ConcertResponse> updateConcertStatus(
            @PathVariable UUID concertId,
            @RequestBody UpdateStatusRequest request) {

        ConcertResponse response = concertService.updateConcertStatus(concertId, request);
        return ResponseEntity.ok(response); //200
    }

    @GetMapping("/{concertId}/tickets")
    public ResponseEntity<PageResponse<TicketListItemResponse>> getTicketsByConcertId(
            @PathVariable UUID concertId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResponse<TicketListItemResponse> response = concertService.getTicketsByConcertId(concertId, page, size);
        return ResponseEntity.ok(response);
    }

    // API để Admin xem danh sách khách hàng cần đền tiền
    @GetMapping("/concerts/{concertId}/refunds")
    public ResponseEntity<?> getPendingRefunds(@PathVariable UUID concertId) {
        List<Ticket> refunds = ticketService.getTicketsPendingRefund(concertId);
        // Nhớ Map cái List<Ticket> này sang DTO trước khi trả về nhé để tránh lỗi vòng lặp JSON
        return ResponseEntity.ok(refunds);
    }
}
