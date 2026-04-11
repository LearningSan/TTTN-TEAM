package com.example.tttnbe.zone.repository;

import com.example.tttnbe.zone.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, UUID> {
    // Xóa sạch Zone của một Concert
    void deleteByConcert_ConcertId(UUID concertId);
}
