package com.example.tttnbe.order.service;

import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.order.dto.DashboardStatsResponse;
import com.example.tttnbe.order.dto.OrderResponse;

public interface OrderService {
    public PageResponse<OrderResponse> getAllOrders(int page, int size, String status);

    public DashboardStatsResponse getDashboardStats();
}
