package com.example.tttnbe.concert.dto;

import java.math.BigDecimal;

public record DashboardStatsResponse(
        BigDecimal totalRevenue,    // Đổi sang BigDecimal
        BigDecimal dailyRevenue,    // Đổi sang BigDecimal
        long ticketsSold,       // Số vé đã bán
        long pendingRefunds,    // Số vé cần hoàn tiền
        long totalConcerts,     // Tổng số concert
        long totalUsers,        // Tổng số người dùng
        long totalOrders        // Tổng số đơn hàng
) {}