package com.example.tttnbe.seat.entity;

import com.example.tttnbe.concert.entity.Concert;
import com.example.tttnbe.zone.entity.Zone;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "seat_tiers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SeatTier {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "tier_id", nullable = false)
    private UUID tierId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    @Column(name = "tier_name", nullable = false, length = 20)
    private String tierName;

    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal price;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(name = "color_code", length = 7)
    private String colorCode;

    @Column(length = 300)
    private String description;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false, updatable = false)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime updatedAt;
}