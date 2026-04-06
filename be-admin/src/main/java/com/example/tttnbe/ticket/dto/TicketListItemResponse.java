package com.example.tttnbe.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketListItemResponse {
    private UUID ticketId;
    private String buyerName;
    private String email;
    private String zoneName;
    private String seatLabel;
    private LocalDateTime purchaseDate;
    private String status;
}
