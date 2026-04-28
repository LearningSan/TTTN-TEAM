package com.example.tttnbe.order.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class OrderResponse {
    private UUID orderId;          // Hoặc 'id' tùy theo Entity của bạn
    private String userName;       // Ai mua
    private String userEmail;      // Email liên hệ
    private String concertTitle;   // Mua vé show nào

    // 1. THÔNG TIN TIỀN TỆ
    private BigDecimal totalAmount;// Tổng tiền
    private String currency;       // ETH / USDT
    private String orderStatus;    // Trạng thái đơn (PENDING, PAID, CANCELLED, REFUNDED)

    // ==========================================
    // 🚀 NHỮNG TRƯỜNG NÊN BỔ SUNG
    // ==========================================

    // 2. THÔNG TIN SỐ LƯỢNG
    private int ticketCount;       // Frontend cực kỳ cần cái này để hiện: "Khách mua 3 vé"

    // 3. THÔNG TIN BLOCKCHAIN (WEB3)
    private String userWallet;     // CỰC KỲ QUAN TRỌNG: Cần để biết hoàn tiền về ví nào
    private String paymentTxHash;  // Mã giao dịch lúc khách mua (Để FE gắn link Etherscan cho uy tín)
    private String refundTxHash;   // Mã giao dịch lúc Admin hoàn tiền (Trả về null nếu chưa hoàn)

    // 4. THÔNG TIN THỜI GIAN
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime paidAt;  // Nên có để biết khách thanh toán lúc mấy giờ
}
