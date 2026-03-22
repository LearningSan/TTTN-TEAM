package com.example.tttnbe.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
public class LogoutRequest {
    private UUID userId;          //id cua user mun dang xuat
    private String refreshToken;  //token muon xoa
}