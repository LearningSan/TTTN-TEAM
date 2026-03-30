package com.example.tttnbe.ticket.dto;

import lombok.Data;

@Data
public class TicketUpdateRequest {
    private String status;
    private String tokenId;
    private String mintTx;
    private String contractAddress;
    private String qrCode;
    private String qrURL;
}
