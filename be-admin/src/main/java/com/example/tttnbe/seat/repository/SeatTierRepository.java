package com.example.tttnbe.seat.repository;

import com.example.tttnbe.seat.entity.SeatTier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SeatTierRepository extends JpaRepository<SeatTier, UUID> {
    // Xóa sạch hạng vé của một Concert
    void deleteByConcert_ConcertId(UUID concertId);
}
