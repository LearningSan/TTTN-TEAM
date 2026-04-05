package com.example.tttnbe.order.entity;

import com.example.tttnbe.auth.entity.User;
import com.example.tttnbe.concert.entity.Concert;
import com.example.tttnbe.payment.entity.PaymentTransaction;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "total_amount", nullable = false, precision = 18, scale = 8)
    private BigDecimal totalAmount;

    @Column(name = "currency",  nullable = false, length = 10)
    private String currency; //USDT - BNB - ETH

    @Column(name = "order_status",  nullable = false, length = 20)
    private String orderStatus; //PAID - PENDING - CANCELLED - EXPIRED

    @Column(name = "wallet_address", length = 100)
    private String walletAddress;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "expires_at", nullable = false)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime expiresAt;

    @Column(name = "paid_at")
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    @UpdateTimestamp
    private LocalDateTime updatedAt;


    //=================================================================
    //Mapping quan he (4)
    //=================================================================
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Người đặt hàng

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concert_id", nullable = false)
    private Concert concert; // Mua vé của concert nào

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private PaymentTransaction payment; // Giao dịch thanh toán của đơn hàng

    @JsonIgnore
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems; // Danh sách chi tiết giỏ hàng
}
