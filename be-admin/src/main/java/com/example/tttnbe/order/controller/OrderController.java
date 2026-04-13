package com.example.tttnbe.order.controller;

import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.order.dto.DashboardStatsResponse;
import com.example.tttnbe.order.dto.OrderDetailResponse;
import com.example.tttnbe.order.dto.OrderResponse;
import com.example.tttnbe.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    // API 1: Lấy toàn bộ danh sách Đơn hàng (Có phân trang và lọc)
    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {

        // Gọi sang Service để lấy data đã được gọt dũa
        PageResponse<OrderResponse> response = orderService.getAllOrders(page, size, status);

        // Trả về mã 200 OK kèm theo cục JSON
        return ResponseEntity.ok(response);
    }

    // API 2: Thống kê tổng quan cho Dashboard
    @GetMapping("/revenue/total")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = orderService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // API 3: Xem chi tiết một đơn hàng cụ thể
    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailResponse> getOrderDetail(@PathVariable UUID id) {
        OrderDetailResponse detail = orderService.getOrderDetail(id);
        return ResponseEntity.ok(detail);
    }
}
