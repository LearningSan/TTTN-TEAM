package com.example.tttnbe.concert.repository;

import com.example.tttnbe.concert.entity.Concert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ConcertRepository extends JpaRepository<Concert, UUID> {

}
