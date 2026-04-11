package com.example.tttnbe.ticket.repository;

import com.example.tttnbe.ticket.dto.TicketDetailResponse;
import com.example.tttnbe.ticket.dto.TicketListItemResponse;
import com.example.tttnbe.ticket.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    //tim ve cua 1 concert (1 concert co nhiu loai ve)
    @Query("SELECT new com.example.tttnbe.ticket.dto.TicketListItemResponse(" +
            "t.ticketId, u.name, u.email, z.zoneName, s.seatLabel, t.purchaseDate, t.status) " +
            "FROM Ticket t " +
            "JOIN t.user u " +
            "JOIN t.zone z " +
            "LEFT JOIN t.seat s " +
            "WHERE t.concert.concertId = :concertId " +
            "ORDER BY t.purchaseDate DESC")
    Page<TicketListItemResponse> findTicketsByConcertId(@Param("concertId") UUID concertId, Pageable pageable);

    //lay chi tiet 1 ve ma user da mua
    @Query("SELECT new com.example.tttnbe.ticket.dto.TicketDetailResponse(" +
            "t.ticketId, t.tokenId, t.mintTx, t.status, t.purchaseDate, t.usedAt, t.qrURL, " + // Đã sửa t.mintTx và t.qrURL
            "u.userId, u.name, u.email, u.phone, t.walletAddress, " +
            "z.zoneName, z.price, z.currency, s.seatLabel, " +
            "o.orderId, pt.paymentId, pt.paymentStatus, pt.transactionHash) " +
            "FROM Ticket t " +
            "JOIN t.user u " +
            "JOIN t.zone z " +
            "LEFT JOIN t.seat s " +
            "JOIN t.order o " +
            "JOIN t.payment pt " +
            "WHERE t.ticketId = :ticketId")
    Optional<TicketDetailResponse> getFullTicketDetailById(@Param("ticketId") UUID ticketId);

    // Đếm xem Concert này đã bán được bao nhiêu vé
    long countByConcert_ConcertId(UUID concertId);
}
