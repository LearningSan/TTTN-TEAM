package com.example.tttnbe.ticket.repository;

import com.example.tttnbe.ticket.dto.TicketListItemResponse;
import com.example.tttnbe.ticket.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    @Query("SELECT new com.example.tttnbe.ticket.dto.TicketListItemResponse(" +
            "t.ticketId, u.name, u.email, z.zoneName, s.seatLabel, t.purchaseDate, t.status) " +
            "FROM Ticket t " +
            "JOIN t.user u " +
            "JOIN t.zone z " +
            "LEFT JOIN t.seat s " +
            "WHERE t.concert.concertId = :concertId " +
            "ORDER BY t.purchaseDate DESC")
    Page<TicketListItemResponse> findTicketsByConcertId(@Param("concertId") UUID concertId, Pageable pageable);
}
