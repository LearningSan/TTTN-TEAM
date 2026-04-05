package com.example.tttnbe.concert.entity;

import com.example.tttnbe.auth.entity.User;
import com.example.tttnbe.venue.entity.Venue;
import com.example.tttnbe.zone.entity.Zone;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "concerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Concert {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "concert_id", nullable = false)
    private UUID concertId;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "artist", nullable = false, length = 200)
    private String artist;

    @Column(name = "concert_date", nullable = false)
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime concertDate;

    @Column(name = "end_date")
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime endDate;

    @Column(name = "description", columnDefinition = "nvarchar(max)")
    private String description;

    @Column(name = "banner_url", length = 500)
    private String bannerURL;

    @Column(name = "sale_start_at")
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime saleStartAt;

    @Column(name = "sale_end_at")
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime saleEndAt;

    @Column(name = "status", nullable = false, length = 20)
    private String status; //COMPLETED - CANCELLED - SOLD_OUT - ON_SALE - DRAFT

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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @OneToMany(mappedBy = "concert", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Zone> zones;
}
