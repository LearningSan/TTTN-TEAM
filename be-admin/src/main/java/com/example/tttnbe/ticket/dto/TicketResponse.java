package com.example.tttnbe.ticket.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {
    private UUID ticketId;
    private UUID concertId;
    private String tokenId;
    private String walletAddress;
    private String status;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime purchaseDate;
    private String concertTitle;
    private String zoneName;
    private String seatLabel;

    private String mintTx;
    private String contractAddress;
    private String qrCode;
    private String qrURL;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime usedAt; // Thời gian đã quét vé vào cổng
}
