package com.example.tttnbe.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
public class TicketDetailResponse {
    private TicketInfo ticketInfo;
    private BuyerInfo buyerInfo;
    private ZoneInfo zoneInfo;
    private TransactionInfo transactionInfo;

    // Siêu Constructor dùng để hứng dữ liệu từ câu query JPQL
    public TicketDetailResponse(
            UUID ticketId, String tokenId, String mintTxHash, String status, LocalDateTime purchaseDate, LocalDateTime usedAt, String qrUrl,
            UUID userId, String name, String email, String phone, String receivingWallet,
            String zoneName, BigDecimal price, String currency, String seatLabel,
            UUID orderId, UUID paymentId, String paymentStatus, String paymentTxHash) {

        this.ticketInfo = new TicketInfo(ticketId, tokenId, mintTxHash, status, purchaseDate, usedAt, qrUrl);
        this.buyerInfo = new BuyerInfo(userId, name, email, phone, receivingWallet);
        this.zoneInfo = new ZoneInfo(zoneName, price, currency, seatLabel);
        this.transactionInfo = new TransactionInfo(orderId, paymentId, paymentStatus, paymentTxHash);
    }

    // --- CÁC CLASS CON BÊN TRONG ---
    @Data @AllArgsConstructor
    public static class TicketInfo {
        private UUID ticketId;
        private String tokenId;
        private String mintTxHash;
        private String status;
        private LocalDateTime purchaseDate;
        private LocalDateTime usedAt;
        private String qrUrl;
    }

    @Data @AllArgsConstructor
    public static class BuyerInfo {
        private UUID userId;
        private String name;
        private String email;
        private String phone;
        private String receivingWallet;
    }

    @Data @AllArgsConstructor
    public static class ZoneInfo {
        private String zoneName;
        private BigDecimal price;
        private String currency;
        private String seatLabel;
    }

    @Data @AllArgsConstructor
    public static class TransactionInfo {
        private UUID orderId;
        private UUID paymentId;
        private String paymentStatus;
        private String paymentTxHash;
    }
}