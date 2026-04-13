package com.example.tttnbe.order.controller;

import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.order.dto.DashboardStatsResponse;
import com.example.tttnbe.order.dto.OrderResponse;
import com.example.tttnbe.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    @GetMapping("/total")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = orderService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
