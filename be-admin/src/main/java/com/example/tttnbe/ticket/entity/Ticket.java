package com.example.tttnbe.ticket.entity;

import com.example.tttnbe.auth.entity.User;
import com.example.tttnbe.concert.entity.Concert;
import com.example.tttnbe.order.entity.Order;
import com.example.tttnbe.order.entity.OrderItem;
import com.example.tttnbe.payment.entity.PaymentTransaction;
import com.example.tttnbe.seat.entity.Seat;
import com.example.tttnbe.zone.entity.Zone;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ticket_id", nullable = false)
    private UUID ticketId;

    @Column(name = "token_id", length = 255, unique = true)
    private String tokenId;

    @Column(name = "wallet_address", nullable = false, length = 100)
    private String walletAddress;

    @Column(name = "mint_tx_hash", length = 255)
    private String mintTx;

    @Column(name = "contract_address", length = 100)
    private String contractAddress;

    @Column(name = "qr_code", columnDefinition = "nvarchar(max)")
    private String qrCode;

    @Column(name = "qr_url", columnDefinition = "nvarchar(max)")
    private String qrURL;

    @Column(name = "status", nullable = false, length = 20)
    private String status; //ACTIVE - CANCELLED - USED - TRANSFERRED - MINTING

    @Column(name = "purchase_date", nullable = false)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime purchaseDate;

    @Column(name = "used_at")
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime usedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    @UpdateTimestamp
    private LocalDateTime updatedAt;


    //=================================================================
    //Mapping quan he (7)
    //=================================================================
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order; // Thuộc đơn hàng nào

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem; // Thuộc chi tiết đơn hàng nào

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Người sở hữu vé

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concert_id", nullable = false)
    private Concert concert; // Vé của Concert nào

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone; // Khu vực nào

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id") // Bỏ nullable = false vì vé đứng thì không có ghế (seat = null)
    private Seat seat; // Ngồi ghế nào

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private PaymentTransaction payment; // Giao dịch thanh toán nào
}
