package com.example.tttnbe.order.service;

import com.example.tttnbe.auth.repository.UserRepository;
import com.example.tttnbe.common.exception.CustomException;
import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.concert.repository.ConcertRepository;
import com.example.tttnbe.order.dto.DashboardStatsResponse;
import com.example.tttnbe.order.dto.OrderDetailResponse;
import com.example.tttnbe.order.dto.OrderItemDetailResponse;
import com.example.tttnbe.order.dto.OrderResponse;
import com.example.tttnbe.order.entity.Order;
import com.example.tttnbe.order.repository.OrderRepository;
import com.example.tttnbe.payment.service.Web3ServiceImpl;
import com.example.tttnbe.ticket.repository.TicketRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private ConcertRepository concertRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private Web3ServiceImpl web3Service; // Gọi "cô thu ngân" Blockchain vào đây

    // API 1: Lấy danh sách đơn hàng cho Admin (Tích hợp Lọc Status + Tìm kiếm Keyword)
    public PageResponse<OrderResponse> getAllOrders(int page, int size, String status, String keyword) {

        int currentPage = (page > 0) ? page - 1 : 0;
        Pageable pageable = PageRequest.of(currentPage, size, Sort.by("createdAt").descending());

        // Chuẩn hóa dữ liệu: Nếu rỗng thì đưa về null để Query SQL chạy đúng
        String validStatus = (status != null && !status.trim().isEmpty()) ? status.trim().toUpperCase() : null;
        String validKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        Page<Order> orderPage;

        if ("NEED_REFUND".equals(validStatus)) {
            // FE chọn tab CẦN HOÀN TIỀN
            orderPage = orderRepository.searchOrdersNeedingRefund(validKeyword, pageable);
        } else {
            // FE chọn các tab khác hoặc lấy Tất cả
            orderPage = orderRepository.searchOrders(validStatus, validKeyword, pageable);
        }

        // Map sang DTO
        Page<OrderResponse> dtoPage = orderPage.map(this::mapToResponse);

        return PageResponse.from(dtoPage);
    }

    // Nằm trong OrderService.java
    public DashboardStatsResponse getDashboardStats(LocalDate selectedDate) {
        LocalDateTime dateToQuery = (selectedDate != null)
                ? selectedDate.atStartOfDay()
                : LocalDate.now().atStartOfDay();

        BigDecimal total = orderRepository.sumTotalRevenue();
        BigDecimal daily = orderRepository.sumRevenueByDate(dateToQuery);

        // Gọi thêm hàm đếm số đơn trong ngày vừa tạo
        long dailyCount = orderRepository.countPaidOrdersByDate(dateToQuery);

        return new DashboardStatsResponse(
                total != null ? total : BigDecimal.ZERO,
                daily != null ? daily : BigDecimal.ZERO,
                ticketRepository.countByStatus("ACTIVE"), // Tổng vé
                dailyCount,                               // Số vé/đơn bán trong ngày
                ticketRepository.countByStatus("CANCELLED"),
                concertRepository.count(),
                userRepository.count(),
                orderRepository.count()
        );
    }

    // API 3: Xem chi tiết một đơn hàng
    public OrderDetailResponse getOrderDetail(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy đơn hàng ID: " + orderId));

        // Map danh sách các item trong đơn hàng
        List<OrderItemDetailResponse> items = order.getOrderItems().stream()
                .map(item -> OrderItemDetailResponse.builder()
                        .orderItemId(item.getOrderItemId())
                        .zoneName(item.getZone().getZoneName())
                        // Lấy Tier Name từ Seat (nếu có) hoặc từ Zone
                        .tierName(item.getSeat() != null ? item.getSeat().getSeatTier().getTierName() : "Vé đứng")
                        .seatLabel(item.getSeat() != null ? item.getSeat().getSeatLabel() : "N/A")
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .toList();

        // 🌟 LẤY MÃ GIAO DỊCH TỪ BẢNG PAYMENT (Nếu khách đã thanh toán)
        String payTxHash = null;
        if (order.getPayment() != null) {
            // Tùy vào việc trong entity PaymentTransaction bạn đặt tên biến TxHash là gì
            payTxHash = order.getPayment().getTransactionHash(); // Sửa getTxHash() lại cho khớp tên biến của bạn
        }

        // Đóng gói toàn bộ thông tin
        return OrderDetailResponse.builder()
                .orderId(order.getOrderId())
                .orderStatus(order.getOrderStatus())
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())
                .createdAt(order.getCreatedAt())
                .expiresAt(order.getExpiresAt())
                .paidAt(order.getPaidAt())
                .note(order.getNote())
                .userId(order.getUser().getUserId())
                .userName(order.getUser().getName())
                .userEmail(order.getUser().getEmail())

                // 🌟 GẮN 3 TRƯỜNG WEB3 VÀO ĐÂY
                .userWallet(order.getWalletAddress() != null ? order.getWalletAddress() : order.getUser().getWalletAddress())
                .paymentTxHash(payTxHash)
                // .refundTxHash(order.getRefundTxHash()) // Nếu Entity Order có trường này thì mở ra

                .concertTitle(order.getConcert().getTitle())
                .venueName(order.getConcert().getVenue().getVenueName())
                .items(items)
                .build();
    }

    @Transactional
    public OrderResponse processRefundOrder(UUID orderId) {
        // 1. Tìm đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy đơn hàng này!"));

        // 2. Chốt chặn an toàn: Chỉ hoàn tiền cho đơn ĐÃ THANH TOÁN
        if (!"PAID".equals(order.getOrderStatus())) {
            throw new CustomException(400, "Lỗi: Chỉ có thể hoàn tiền cho đơn hàng đã thanh toán (PAID)!");
        }

        // 3. Lấy thông tin ví khách và số tiền cần hoàn
        // (Lưu ý: Chỗ order.getUserWallet() ông tự chỉnh lại cho khớp với tên biến trong Entity của ông nhé)
        String customerWallet = order.getUser().getWalletAddress();
        BigDecimal refundAmount = order.getTotalAmount();

        // 4. Kêu gọi Web3 chọc xuống Smart Contract để trả ETH
        // Nếu Contract hết tiền hoặc nghẽn mạng, hàm này sẽ tự quăng lỗi 500, code bên dưới sẽ dừng ngay lập tức.
        String txHash = web3Service.sendRefund(customerWallet, refundAmount);

        // 5. Nếu Web3 chạy êm xuôi -> Cập nhật trạng thái đơn hàng trong DB
        order.setOrderStatus("REFUNDED");
        // order.setRefundTxHash(txHash); // Khuyên dùng: Nếu DB ông có cột này thì nên lưu lại mã TxHash làm bằng chứng

        Order savedOrder = orderRepository.save(order);

        // 6. Trả kết quả về cho Controller
        return mapToResponse(savedOrder);
    }

    // --------------------------------------------------------
    // HÀM MAPPER: Chuyển đổi từ Order Entity sang Order Response
    // --------------------------------------------------------
    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .orderId(order.getOrderId())

                // 1. THÔNG TIN NGƯỜI MUA
                .userName(order.getUser() != null ? order.getUser().getName() : "N/A")
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : "N/A")

                // Lấy ví từ User (nếu có), nếu không có thì lấy trực tiếp từ Order
                .userWallet(order.getUser() != null && order.getUser().getWalletAddress() != null
                        ? order.getUser().getWalletAddress()
                        : order.getWalletAddress())

                // 2. THÔNG TIN SỰ KIỆN & VÉ (Đã sửa thành getOrderItems)
                .concertTitle(order.getConcert() != null ? order.getConcert().getTitle() : "Chưa xác định")
                .ticketCount(order.getOrderItems() != null ? order.getOrderItems().size() : 0)

                // 3. THÔNG TIN TIỀN TỆ
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())
                .orderStatus(order.getOrderStatus())

                // 4. THÔNG TIN THỜI GIAN
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt()) // Trong Entity có trường này nên mình mở ra luôn

                .build();
    }
}