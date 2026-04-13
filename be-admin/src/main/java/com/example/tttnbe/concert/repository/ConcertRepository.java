package com.example.tttnbe.concert.repository;

import com.example.tttnbe.concert.entity.Concert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ConcertRepository extends JpaRepository<Concert, UUID> {
    // Kiểm tra đụng show KHI UPDATE (Phải loại trừ ID của chính nó ra)
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
            "FROM Concert c " +
            "WHERE c.venue.venueId = :venueId " +
            "AND c.concertId != :currentConcertId " + // 👈 Chốt chặn ăn tiền là đây!
            "AND c.status != 'CANCELLED' " +
            "AND c.concertDate < :endDate " +
            "AND c.endDate > :startDate")
    boolean existsByVenueIdAndDateOverlapForUpdate(
            @Param("venueId") UUID venueId,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate,
            @Param("currentConcertId") UUID currentConcertId);
}
