package com.example.tttnbe.common.scheduler;

import com.example.tttnbe.concert.repository.ConcertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class ConcertStatusScheduler {

    private final ConcertRepository concertRepository;

    // Chạy mỗi giờ 1 lần (Tại phút thứ 0 của mỗi giờ)
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void autoUpdateCompletedConcerts() {
        log.info("⏳ [CronJob] Đang quét các sự kiện đã kết thúc...");

        // Cập nhật tất cả Concert có endDate < Hiện tại VÀ đang ở trạng thái ON_SALE hoặc SOLD_OUT thành COMPLETED
        int updatedCount = concertRepository.updateStatusForCompletedConcerts(LocalDateTime.now());

        if (updatedCount > 0) {
            log.info("✅ [CronJob] Đã tự động chuyển {} sự kiện sang trạng thái COMPLETED.", updatedCount);
        }
    }
}