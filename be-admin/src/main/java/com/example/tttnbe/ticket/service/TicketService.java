package com.example.tttnbe.ticket.service;

import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.ticket.dto.TicketDetailResponse;
import com.example.tttnbe.ticket.dto.TicketRequest;
import com.example.tttnbe.ticket.dto.TicketResponse;
import com.example.tttnbe.ticket.dto.TicketUpdateRequest;
import com.example.tttnbe.ticket.entity.Ticket;

import java.util.List;
import java.util.UUID;

public interface TicketService {
    public TicketResponse createTicket(TicketRequest ticketRequest);

    public PageResponse<TicketResponse> getAllTickets(int page, int size);

    public TicketResponse getTicket(UUID ticketId);

    public TicketResponse updateTicket(UUID ticketId, TicketUpdateRequest request);

    public void deleteTicket(UUID ticketId);

    public TicketDetailResponse getTicketDetail(UUID ticketId);

    public List<Ticket> getTicketsPendingRefund(UUID concertId);
}
