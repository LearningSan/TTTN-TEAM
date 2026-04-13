package com.example.tttnbe.order.service;

import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.order.dto.DashboardStatsResponse;
import com.example.tttnbe.order.dto.OrderDetailResponse;
import com.example.tttnbe.order.dto.OrderResponse;

import java.util.UUID;

public interface OrderService {
    public PageResponse<OrderResponse> getAllOrders(int page, int size, String status);

    public DashboardStatsResponse getDashboardStats();

    public OrderDetailResponse getOrderDetail(UUID orderId);
}
