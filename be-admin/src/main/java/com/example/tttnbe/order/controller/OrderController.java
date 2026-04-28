package com.example.tttnbe.order.controller;

import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.order.dto.DashboardStatsResponse;
import com.example.tttnbe.order.dto.OrderDetailResponse;
import com.example.tttnbe.order.dto.OrderResponse;
import com.example.tttnbe.order.entity.Order;
import com.example.tttnbe.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    // API 1: Lấy toàn bộ danh sách Đơn hàng (Có phân trang, lọc và TÌM KIẾM)
    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) { // 👈 Thêm dòng này

        // Gọi sang Service truyền thêm keyword
        PageResponse<OrderResponse> response = orderService.getAllOrders(page, size, status, keyword);

        return ResponseEntity.ok(response);
    }

    // Nằm trong OrderController.java
    @GetMapping("/revenue/total")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        // Gọi Service và truyền ngày (nếu có) xuống
        DashboardStatsResponse stats = orderService.getDashboardStats(date);

        return ResponseEntity.ok(stats);
    }

    // API 3: Xem chi tiết một đơn hàng cụ thể
    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailResponse> getOrderDetail(@PathVariable UUID id) {
        OrderDetailResponse detail = orderService.getOrderDetail(id);
        return ResponseEntity.ok(detail);
    }

    /**
     * API: Hoàn tiền một đơn hàng
     * Method: POST /api/admin/orders/{orderId}/refund
     */
    @PostMapping("/{orderId}/refund")
    // @PreAuthorize("hasRole('ADMIN')") // Nếu ông dùng Spring Security thì mở cái này ra
    public ResponseEntity<?> refundOrder(@PathVariable UUID orderId) {

        // Gọi Service xử lý
        OrderResponse refundedOrder = orderService.processRefundOrder(orderId);

        // Đóng gói JSON trả về cho FE theo đúng cấu trúc
        return ResponseEntity.ok(
                Map.of(
                        "status", 200,
                        "message", "Hoàn tiền thành công trên Blockchain!",
                        "data", refundedOrder
                )
        );
    }
}
