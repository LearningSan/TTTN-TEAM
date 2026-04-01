package com.example.tttnbe.payment.entity;

import com.example.tttnbe.auth.entity.User;
import com.example.tttnbe.concert.entity.Concert;
import com.example.tttnbe.order.entity.Order;
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
import java.util.UUID;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    @Column(name = "amount", nullable = false, precision = 18, scale = 8)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency; //USDT - BNB - ETH

    @Column(name = "from_wallet", nullable = false, length = 100)
    private String fromWallet;

    @Column(name = "to_wallet", nullable = false, length = 100)
    private String toWallet;

    @Column(name = "transaction_hash", length = 255, unique = true)
    private String transactionHash;

    @Column(name = "block_number")
    private Long blockNumber;

    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus; //SUCCESS - FAILED - PENDING - REFUNDED

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "confirmed_at")
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime confirmedAt;

    @Column(name = "retry_count",  nullable = false)
    private Integer retryCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    @UpdateTimestamp
    private LocalDateTime updatedAt;


    //=================================================================
    //Mapping quan he (3)
    //=================================================================
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order; // Thuộc đơn hàng nào

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Của user nào thanh toán

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concert_id", nullable = false)
    private Concert concert; // Trả tiền cho concert nào
}
