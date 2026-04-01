package com.example.tttnbe.order.entity;

import com.example.tttnbe.seat.entity.Seat;
import com.example.tttnbe.zone.entity.Zone;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "order_item_id", nullable = false)
    private UUID orderItemId;

    @Column(name = "quantity",  nullable = false)
    private Integer quantity;

    @Column(name = "unit_price",  nullable = false, precision = 18, scale = 8)
    private BigDecimal unitPrice;

    //sql tu tinh cot nay - nen khong can nhap, sua
    //cong thuc: quantity * unitPrice
    @Column(name = "subtotal", precision = 37, scale = 16, insertable = false, updatable = false)
    private BigDecimal subtotal;


    //=================================================================
    //Mapping quan he (3)
    //=================================================================
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order; // Nằm trong đơn hàng nào

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone; // Mua vé ở khu vực nào (Zone)

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id") // BỎ nullable = false (Vì vé đứng không có ghế)
    private Seat seat; // Ngồi ở ghế nào
}
