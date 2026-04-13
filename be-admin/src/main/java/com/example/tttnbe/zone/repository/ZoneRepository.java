package com.example.tttnbe.zone.repository;

import com.example.tttnbe.zone.entity.Zone;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, UUID> {
    // Xóa sạch Zone của một Concert
    void deleteByConcert_ConcertId(UUID concertId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT z FROM Zone z WHERE z.zoneId = :zoneId")
    Optional<Zone> findByIdWithLock(@Param("zoneId") UUID zoneId);
}
