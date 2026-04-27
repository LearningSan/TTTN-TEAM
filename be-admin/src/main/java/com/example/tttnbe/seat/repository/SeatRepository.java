package com.example.tttnbe.seat.repository;

import com.example.tttnbe.seat.entity.Seat;
import jakarta.persistence.LockModeType;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
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

    // 5. Đếm TỔNG SỐ GHẾ của một Hạng vé
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.seatTier.tierId = :tierId")
    Integer countTotalSeatsByTierId(@Param("tierId") UUID tierId);

    // 6. Đếm SỐ GHẾ CÒN TRỐNG (AVAILABLE) của một Hạng vé
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.seatTier.tierId = :tierId AND s.status = 'AVAILABLE'")
    Integer countAvailableSeatsByTierId(@Param("tierId") UUID tierId);

    // Lấy ghế kèm theo cơ chế PESSIMISTIC_WRITE (Khóa dòng trong SQL để chống 2 người mua cùng 1 lúc)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.seatId = :seatId")
    Optional<Seat> findByIdWithLock(@Param("seatId") UUID seatId);

    @Transactional
    void deleteByZone_ZoneId(UUID zoneId);

    List<Seat> findByZone_ZoneIdOrderByRowLabelAscSeatNumberAsc(UUID zoneId);
}
