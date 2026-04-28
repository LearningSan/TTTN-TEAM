package com.example.tttnbe.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private BigDecimal totalRevenue;    // Đổi sang BigDecimal
    private BigDecimal dailyRevenue;    // Đổi sang BigDecimal
    private long totalTicketsSold;   // Dùng cho cục bự "VÉ ĐÃ BÁN"
    private long dailyTicketsSold;   // DÙNG CHO DÒNG CHỮ XANH LÁ BÊN DƯỚI
    private long pendingRefunds;    // Số vé cần hoàn tiền
    private long totalConcerts;     // Tổng số concert
    private long totalUsers;        // Tổng số người dùng
    private long totalOrders;        // Tổng số đơn hàng
}