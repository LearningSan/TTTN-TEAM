package com.example.tttnbe.concert.service;

import com.example.tttnbe.auth.entity.User;
import com.example.tttnbe.auth.repository.UserRepository;
import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.concert.dto.ConcertRequest;
import com.example.tttnbe.concert.dto.ConcertResponse;
import com.example.tttnbe.concert.dto.UpdateConcertRequest;
import com.example.tttnbe.concert.entity.Concert;
import com.example.tttnbe.concert.repository.ConcertRepository;
import com.example.tttnbe.common.exception.CustomException;
import com.example.tttnbe.seat.entity.Seat;
import com.example.tttnbe.seat.repository.SeatRepository;
import com.example.tttnbe.venue.entity.Venue;
import com.example.tttnbe.venue.repository.VenueRepository;
import com.example.tttnbe.zone.dto.ZoneRequest;
import com.example.tttnbe.zone.dto.ZoneResponse;
import com.example.tttnbe.zone.entity.Zone;
import com.example.tttnbe.zone.repository.ZoneRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ConcertServiceImpl implements ConcertService {
    @Autowired
    private ConcertRepository concertRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private SeatRepository seatRepository;

    //dung chung - bien entity thanh dto
    private ConcertResponse mapToResponse(Concert concert) {
        //xu ly luu zone
        List<ZoneResponse> zoneResponses = null;
        if (concert.getZones() != null && !concert.getZones().isEmpty()) {
            zoneResponses = concert.getZones().stream().map(zone ->
                    new ZoneResponse(
                            zone.getZoneId(),
                            zone.getZoneName(),
                            zone.getPrice(),
                            zone.getCurrency(),
                            zone.getTotalSeats(),
                            zone.getAvailableSeats(),
                            zone.getColorCode(),
                            zone.isHasSeatMap(),
                            zone.getDisplayOrder()
                    )
            ).collect(Collectors.toList());
        }

        return ConcertResponse.builder()
                .concertId(concert.getConcertId())
                .title(concert.getTitle())
                .artist(concert.getArtist())
                .concertDate(concert.getConcertDate())
                .endDate(concert.getEndDate())
                .description(concert.getDescription())
                .bannerURL(concert.getBannerURL())
                .saleStartAt(concert.getSaleStartAt())
                .saleEndAt(concert.getSaleEndAt())
                .status(concert.getStatus())
                // Lấy nhẹ cái id, tên của Organizer và Venue ra thôi
                .organizerId(concert.getOrganizer().getUserId())
                .organizerName(concert.getOrganizer().getName())
                .venueId(concert.getVenue().getVenueId())
                .venueName(concert.getVenue().getVenueName())
                .zones(zoneResponses)
                .build();
    }

    //1 - create
    @Transactional
    public ConcertResponse createConcert(ConcertRequest concertRequest) {
        Concert concert = new Concert();

        concert.setTitle(concertRequest.getTitle());
        concert.setArtist(concertRequest.getArtist());
        concert.setConcertDate(concertRequest.getConcertDate());
        concert.setEndDate(concertRequest.getEndDate());
        concert.setDescription(concertRequest.getDescription());
        concert.setBannerURL(concertRequest.getBannerURL());
        concert.setSaleStartAt(concertRequest.getSaleStartAt());
        concert.setSaleEndAt(concertRequest.getSaleEndAt());
        concert.setStatus("DRAFT");

        //tim organizer trong sercurity
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        User organizer = userRepository.findById(UUID.fromString(currentUserId))
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy thông tin Admin (ID: " + currentUserId + ")"));
        concert.setOrganizer(organizer);

        //tim venue
        Venue venue = venueRepository.findById(concertRequest.getVenueId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy địa điểm tổ chức với ID: " + concertRequest.getVenueId()));
        concert.setVenue(venue);

        //map thanh dto de tra ve thong tin can thiet
        Concert savedConcert = concertRepository.save(concert);

        //xu ly luu zone
        if (concertRequest.getZones() != null && !concertRequest.getZones().isEmpty()) {
            List<Zone> zonesToSave = new ArrayList<>();
            List<Seat> allSeatsToSave = new ArrayList<>();

            for (ZoneRequest zReq : concertRequest.getZones()) {
                Zone zone = new Zone();

                // 1. SET TẤT CẢ THÔNG TIN CƠ BẢN CỦA ZONE TRƯỚC
                zone.setConcert(savedConcert);
                zone.setZoneName(zReq.getZoneName());
                zone.setPrice(zReq.getPrice());
                zone.setCurrency(zReq.getCurrency());
                zone.setColorCode(zReq.getColorCode());
                zone.setHasSeatMap(zReq.getHasSeatMap() != null ? zReq.getHasSeatMap() : false);
                zone.setDisplayOrder(zReq.getDisplayOrder());
                zone.setStatus("ACTIVE");
                zone.setSoldSeats(0);

                // 2. XỬ LÝ SỐ LƯỢNG VÉ VÀ SINH GHẾ
                if (zone.isHasSeatMap()) {
                    // Tinh total_seats (so hang ghe * so ghe moi hang)
                    int totalSeats = zReq.getRowCount() * zReq.getSeatsPerRow();
                    zone.setTotalSeats(totalSeats);
                    zone.setAvailableSeats(totalSeats);

                    // Bây giờ Zone ĐÃ ĐẦY ĐỦ THÔNG TIN -> Mới được save xuống DB để lấy ID
                    Zone savedZone = zoneRepository.save(zone);
                    zonesToSave.add(savedZone);

                    // Sinh ghế
                    char startRow = zReq.getRowPrefix().toUpperCase().charAt(0);
                    for (int i = 0; i < zReq.getRowCount(); i++) {
                        String currentRow = String.valueOf((char) (startRow + i));

                        for (int j = 1; j <= zReq.getSeatsPerRow(); j++) {
                            Seat seat = new Seat();
                            seat.setZone(savedZone);
                            seat.setConcert(savedConcert);
                            seat.setRowLabel(currentRow);
                            seat.setSeatNumber(j);
                            seat.setSeatLabel(currentRow + j);
                            seat.setStatus("AVAILABLE");
                            allSeatsToSave.add(seat);
                        }
                    }

                    if (!allSeatsToSave.isEmpty()) {
                        seatRepository.saveAll(allSeatsToSave);
                    }
                }
            }

            savedConcert.setZones(zonesToSave);
        }

        return mapToResponse(savedConcert);
    }

    //2 - getAll co phan trang
    public PageResponse<ConcertResponse> getAllConcerts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Concert> concertPage = concertRepository.findAll(pageable);
        Page<ConcertResponse> dtoPage = concertPage.map(this::mapToResponse);

        return PageResponse.from(dtoPage);
    }

    //3 - getById
    public ConcertResponse getConcert(UUID concertId) {
        Concert concert = concertRepository.findById(concertId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy concert với ID: " + concertId));

        return mapToResponse(concert);
    }

    //4 - update
    public ConcertResponse updateConcert(UUID concertId, UpdateConcertRequest concertRequest) {
        Concert concert = concertRepository.findById(concertId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy concert với ID: " + concertId));

        concert.setTitle(concertRequest.getTitle());
        concert.setArtist(concertRequest.getArtist());
        concert.setConcertDate(concertRequest.getConcertDate());
        concert.setEndDate(concertRequest.getEndDate());
        concert.setDescription(concertRequest.getDescription());
        concert.setBannerURL(concertRequest.getBannerURL());
        concert.setSaleStartAt(concertRequest.getSaleStartAt());
        concert.setSaleEndAt(concertRequest.getSaleEndAt());
        concert.setStatus(concertRequest.getStatus());

        if (!concert.getVenue().getVenueId().equals(concertRequest.getVenueId())) {
            Venue venue = venueRepository.findById(concertRequest.getVenueId())
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy địa điểm tổ chức"));
            concert.setVenue(venue);
        }

        Concert savedConcert = concertRepository.save(concert);
        return mapToResponse(savedConcert);
    }

    // 5 - delete (Soft Delete - Xóa mềm)
    public void deleteConcert(UUID concertId) {
        Concert concert = concertRepository.findById(concertId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy concert với ID: " + concertId));

        // Kiểm tra xem sự kiện này đã bị hủy từ trước chưa
        if ("CANCELLED".equals(concert.getStatus())) {
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Sự kiện này đã bị hủy từ trước rồi!");
        }

        // Thay vì dùng lệnh delete(), ta chỉ đổi trạng thái thành CANCELLED
        concert.setStatus("CANCELLED");

        // Lưu bản cập nhật xuống Database
        concertRepository.save(concert);

        /*
         * 💡 GHI CHÚ CHO SAU NÀY (BLOCKCHAIN):
         * Tại đây, sau khi lưu DB thành công, bạn có thể gọi thêm API/Service của Smart Contract
         * để vô hiệu hóa (revoke) hàng loạt các vé NFT thuộc về Concert này nếu cần.
         */
    }
}
