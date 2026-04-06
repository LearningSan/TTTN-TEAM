package com.example.tttnbe.seat.repository;

import com.example.tttnbe.seat.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SeatRepository extends JpaRepository<Seat, UUID> {
    //dem hang ghe cua 1 khu vuc - rowCount
    @Query("SELECT COUNT(DISTINCT s.rowLabel) " +
            "FROM Seat s " +
            "WHERE s.zone.zoneId = :zoneId")
    Integer countRowsByZoneId(@Param("zoneId") UUID zoneId);

    //tim stt lon nhat cua moi hang ghe - seatsPerRow
    @Query("SELECT MAX(s.seatNumber) " +
            "FROM Seat s " +
            "WHERE s.zone.zoneId = :zoneId")
    Integer findMaxSeatNumberByZoneId(@Param("zoneId") UUID zoneId);

    //tim ky tu cua hang ghe dau tien - rowPrefix
    @Query("SELECT MIN(s.rowLabel) " +
            "FROM Seat s " +
            "WHERE s.zone.zoneId = :zoneId")
    String findFirstRowLabelByZoneId(@Param("zoneId") UUID zoneId);
}
