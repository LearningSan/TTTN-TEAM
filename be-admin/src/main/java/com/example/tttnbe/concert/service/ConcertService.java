package com.example.tttnbe.concert.service;

import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.concert.dto.ConcertRequest;
import com.example.tttnbe.concert.dto.ConcertResponse;
import com.example.tttnbe.concert.entity.Concert;

import java.util.UUID;

public interface ConcertService {
    public ConcertResponse createConcert(ConcertRequest concertRequest);

    public PageResponse<ConcertResponse> getAllConcerts(int page, int size);

    public ConcertResponse getConcert(UUID concertId);

    public ConcertResponse updateConcert(UUID concertId, ConcertRequest concertRequest);

    public void deleteConcert(UUID concertId);
}
