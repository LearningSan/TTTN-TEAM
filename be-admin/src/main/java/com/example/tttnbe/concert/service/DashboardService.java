package com.example.tttnbe.concert.service;

import com.example.tttnbe.auth.repository.UserRepository;
import com.example.tttnbe.concert.dto.DashboardStatsResponse;
import com.example.tttnbe.concert.repository.ConcertRepository;
import com.example.tttnbe.order.repository.OrderRepository;
import com.example.tttnbe.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final OrderRepository orderRepository;
    private final TicketRepository ticketRepository;
    private final ConcertRepository concertRepository;
    private final UserRepository userRepository;

    public DashboardStatsResponse getQuickStats(LocalDateTime selectedDate) {
        // Giả sử Repository của đệ đang trả về BigDecimal
        BigDecimal total = orderRepository.sumTotalRevenue();
        BigDecimal daily = orderRepository.sumRevenueByDate(selectedDate);

        return new DashboardStatsResponse(
                // Cách sửa: Thay 0.0 bằng BigDecimal.ZERO
                total != null ? total : BigDecimal.ZERO,
                daily != null ? daily : BigDecimal.ZERO,

                ticketRepository.countByStatus("ACTIVE"),
                ticketRepository.countByStatus("CANCELLED"),
                concertRepository.count(),
                userRepository.count(),
                orderRepository.count()
        );
    }
}