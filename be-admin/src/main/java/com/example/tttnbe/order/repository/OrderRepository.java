package com.example.tttnbe.order.repository;

import com.example.tttnbe.order.dto.OrderListItemResponse;
import com.example.tttnbe.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    // Tìm tất cả có phân trang
    Page<Order> findAll(Pageable pageable);

    // Tìm theo trạng thái (PAID, PENDING...) có phân trang
    Page<Order> findByOrderStatus(String orderStatus, Pageable pageable);

    // 🌟 Nhờ Database cộng tổng tiền của những đơn đã thanh toán (PAID)
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.orderStatus = 'PAID'")
    BigDecimal sumTotalRevenue();

    // 🌟 Đếm xem có bao nhiêu đơn đã thanh toán thành công
    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderStatus = 'PAID'")
    long countPaidOrders();

    @Query("SELECT new com.example.tttnbe.order.dto.OrderListItemResponse(" +
            "o.orderId, u.name, u.email, o.totalAmount, o.currency, o.orderStatus, o.paidAt) " +
            "FROM Order o JOIN o.user u " + // Join với User để lấy info
            "WHERE o.concert.concertId = :concertId " +
            "ORDER BY o.paidAt DESC")
    Page<OrderListItemResponse> findOrdersByConcertId(
            @Param("concertId") UUID concertId,
            Pageable pageable
    );

    // 2. Doanh thu theo một ngày cụ thể (Chuyển Double -> BigDecimal)
    @Query("SELECT SUM(o.totalAmount) FROM Order o " +
            "WHERE o.orderStatus = 'PAID' " +
            "AND CAST(o.paidAt AS date) = CAST(:date AS date)")
    BigDecimal sumRevenueByDate(@Param("date") LocalDateTime date);

    // 3. Doanh thu theo tháng
    @Query("SELECT SUM(o.totalAmount) FROM Order o " +
            "WHERE o.orderStatus = 'PAID' " +
            "AND MONTH(o.paidAt) = :month AND YEAR(o.paidAt) = :year")
    Double sumRevenueByMonth(@Param("month") int month, @Param("year") int year);

    // Đếm số đơn hàng thành công theo một ngày cụ thể
    @Query("SELECT COUNT(o) FROM Order o " +
            "WHERE o.orderStatus = 'PAID' " +
            "AND CAST(o.paidAt AS date) = CAST(:date AS date)")
    long countPaidOrdersByDate(@Param("date") LocalDateTime date);

    // Lọc các đơn PAID của những Concert đã CANCELLED
    @Query("SELECT o FROM Order o WHERE o.orderStatus = 'PAID' AND o.concert.status = 'CANCELLED'")
    Page<Order> findOrdersNeedingRefund(Pageable pageable);

    // 1. Lọc theo Status bình thường + Tìm kiếm Keyword
    @Query("SELECT o FROM Order o WHERE " +
            "(:status IS NULL OR o.orderStatus = :status) AND " +
            "(:keyword IS NULL OR LOWER(o.user.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(o.user.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(o.concert.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "o.orderId = :orderid)")
    Page<Order> searchOrders(@Param("status") String status, @Param("keyword") String keyword, @Param("orderid") UUID orderid, Pageable pageable);

    // 2. Lọc riêng cho tab CẦN HOÀN TIỀN (NEED_REFUND) + Tìm kiếm Keyword
    @Query("SELECT o FROM Order o WHERE o.orderStatus = 'PAID' AND o.concert.status = 'CANCELLED' AND " +
            "(:keyword IS NULL OR LOWER(o.user.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(o.user.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(o.concert.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Order> searchOrdersNeedingRefund(@Param("keyword") String keyword, Pageable pageable);
}
