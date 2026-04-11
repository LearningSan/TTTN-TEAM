package com.example.tttnbe.seat.repository;

import com.example.tttnbe.seat.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SeatRepository extends JpaRepository<Seat, UUID> {
    // 1. Đếm số lượng hàng ghế của 1 Hạng vé (rowCount)
    @Query("SELECT COUNT(DISTINCT s.rowLabel) " +
            "FROM Seat s " +
            "WHERE s.seatTier.tierId = :tierId")
    Integer countRowsByTierId(@Param("tierId") UUID tierId);

    // 2. Tìm số lượng ghế lớn nhất trên 1 hàng của Hạng vé (seatsPerRow)
    @Query("SELECT MAX(s.seatNumber) " +
            "FROM Seat s " +
            "WHERE s.seatTier.tierId = :tierId")
    Integer findMaxSeatNumberByTierId(@Param("tierId") UUID tierId);

    // 3. Tìm ký tự của hàng ghế đầu tiên (rowPrefix)
    // (Vẫn dùng nativeQuery cho chuẩn xác vì ORDER BY độ dài string trong JPQL hơi phức tạp)
    @Query(value = "SELECT TOP 1 row_label " +
            "FROM seats " +
            "WHERE tier_id = :tierId " +
            "ORDER BY LEN(row_label) ASC, row_label ASC", nativeQuery = true)
    String findFirstRowLabelByTierId(@Param("tierId") UUID tierId);

    // Xóa sạch ghế của một Concert
    void deleteByConcert_ConcertId(UUID concertId);
}
