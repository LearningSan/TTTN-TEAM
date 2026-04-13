package com.example.tttnbe.order.service;

import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.order.dto.DashboardStatsResponse;
import com.example.tttnbe.order.dto.OrderResponse;
import com.example.tttnbe.order.entity.Order;
import com.example.tttnbe.order.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    // API 1: Lấy danh sách đơn hàng cho Admin
    public PageResponse<OrderResponse> getAllOrders(int page, int size, String status) {

        // Fix lỗi trang số 0 của Spring Boot
        int currentPage = (page > 0) ? page - 1 : 0;

        // Sắp xếp đơn hàng mới nhất lên đầu
        Pageable pageable = PageRequest.of(currentPage, size, Sort.by("createdAt").descending());

        Page<Order> orderPage;

        // Nếu FE truyền status (ví dụ: PAID), thì lọc theo status. Nếu không thì lấy tất cả.
        if (status != null && !status.isEmpty()) {
            orderPage = orderRepository.findByOrderStatus(status.toUpperCase(), pageable);
        } else {
            orderPage = orderRepository.findAll(pageable);
        }

        // Map Entity sang DTO
        Page<OrderResponse> dtoPage = orderPage.map(order -> OrderResponse.builder()
                .orderId(order.getOrderId())
                .userName(order.getUser().getName()) // 👈 Lấy tên từ bảng User
                .userEmail(order.getUser().getEmail()) // 👈 Lấy email từ bảng User
                .concertTitle(order.getConcert().getTitle()) // 👈 Lấy tên show từ bảng Concert
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())
                .orderStatus(order.getOrderStatus())
                .createdAt(order.getCreatedAt())
                .build());

        return PageResponse.from(dtoPage);
    }

    // API 2: Thống kê Doanh thu Tổng (Chuẩn DTO)
    public DashboardStatsResponse getDashboardStats() {
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        long totalPaidOrders = orderRepository.countPaidOrders();

        // Xử lý an toàn nếu chưa có doanh thu
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        // Dùng Builder pattern gọn gàng và tường minh
        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalPaidOrders(totalPaidOrders)
                .currency("USDT")
                .build();
    }
}