package com.example.tttnbe.order.repository;

import com.example.tttnbe.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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
}
