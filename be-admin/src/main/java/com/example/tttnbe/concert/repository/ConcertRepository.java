package com.example.tttnbe.concert.repository;

import com.example.tttnbe.concert.entity.Concert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    @Query("SELECT c FROM Concert c WHERE " +
            "(:keyword IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.artist) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:venueId IS NULL OR c.venue.venueId = :venueId) " +
            "AND (:status IS NULL OR c.status = :status)")
    Page<Concert> searchConcerts(
            @Param("keyword") String keyword,
            @Param("venueId") UUID venueId,
            @Param("status") String status,
            Pageable pageable);

    @Modifying
    @Query("UPDATE Concert c SET c.status = 'COMPLETED' WHERE c.endDate < :now AND c.status IN ('ON_SALE', 'SOLD_OUT')")
    int updateStatusForCompletedConcerts(@Param("now") LocalDateTime now);

    // Trong file ConcertRepository.java
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
            "FROM Concert c WHERE c.venue.venueId = :venueId " +
            "AND c.status != 'CANCELLED' " + // Bỏ qua các sự kiện đã bị hủy
            "AND c.concertDate < :endDate AND c.endDate > :startDate")
    boolean existsOverlappingConcert(
            @Param("venueId") UUID venueId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
