package com.example.tttnbe.seat.entity;

import com.example.tttnbe.concert.entity.Concert;
import com.example.tttnbe.zone.entity.Zone;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
//khong trung ghe trong 1 khu vuc
@Table(name = "seats", uniqueConstraints = {
        @UniqueConstraint(name = "uq_seat_position", columnNames = {"zone_id", "row_label", "seat_number"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "seat_id", nullable = false)
    private UUID seatId;

    @Column(name = "row_label",  nullable = false, length = 10)
    private String rowLabel;

    @Column(name = "seat_number",  nullable = false)
    private Integer seatNumber;

    @Column(name = "seat_label",  nullable = false, length = 20)
    private String seatLabel;

    @Column(name = "status",  nullable = false, length = 20)
    private String status; //BOOKED - LOCKED - AVAILABLE

    @Column(name = "locked_at")
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime lockedAt;

    @Column(name = "locked_by_user_id")
    private UUID lockedByUser;

    @Column(name = "lock_expires_at")
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime lockExpiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    @CreationTimestamp
    private LocalDateTime createdAt;


    //=================================================================
    //Mapping quan he (2)
    //=================================================================
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone; // Ghế này thuộc khu vực nào

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concert_id", nullable = false)
    private Concert concert; // Ghế này thuộc concert nào
}
