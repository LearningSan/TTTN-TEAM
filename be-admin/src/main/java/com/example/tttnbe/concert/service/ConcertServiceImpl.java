package com.example.tttnbe.concert.service;

import com.example.tttnbe.auth.entity.User;
import com.example.tttnbe.auth.repository.UserRepository;
import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.concert.dto.ConcertRequest;
import com.example.tttnbe.concert.dto.ConcertResponse;
import com.example.tttnbe.concert.dto.UpdateConcertRequest;
import com.example.tttnbe.concert.dto.UpdateStatusRequest;
import com.example.tttnbe.concert.entity.Concert;
import com.example.tttnbe.concert.repository.ConcertRepository;
import com.example.tttnbe.common.exception.CustomException;
import com.example.tttnbe.seat.dto.TierResponse;
import com.example.tttnbe.seat.entity.Seat;
import com.example.tttnbe.seat.entity.SeatTier;
import com.example.tttnbe.seat.repository.SeatRepository;
import com.example.tttnbe.seat.repository.SeatTierRepository;
import com.example.tttnbe.ticket.dto.TicketListItemResponse;
import com.example.tttnbe.ticket.repository.TicketRepository;
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

import java.time.LocalDateTime;
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

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private SeatTierRepository seatTierRepository;

    // Hàm dùng chung - Biến Entity thành DTO
    private ConcertResponse mapToResponse(Concert concert) {
        List<ZoneResponse> zoneResponses = null;

        if (concert.getZones() != null && !concert.getZones().isEmpty()) {
            zoneResponses = concert.getZones().stream().map(zone -> {

                List<TierResponse> tierResponses = new ArrayList<>();
                int calculatedZoneTotalSeats = 0;       // 🌟 Biến tạm cộng dồn tổng ghế
                int calculatedZoneAvailableSeats = 0;   // 🌟 Biến tạm cộng dồn ghế trống

                if (zone.getSeatTiers() != null && !zone.getSeatTiers().isEmpty()) {
                    // Dùng vòng lặp for thường thay vì stream().map() để dễ dàng cộng dồn biến bên ngoài
                    for (SeatTier tier : zone.getSeatTiers()) {

                        String rowPrefix = seatRepository.findFirstRowLabelByTierId(tier.getTierId());
                        Integer rowCount = seatRepository.countRowsByTierId(tier.getTierId());
                        Integer seatsPerRow = seatRepository.findMaxSeatNumberByTierId(tier.getTierId());

                        // Lấy thông số ghế tươi từ DB
                        Integer tierTotalSeats = seatRepository.countTotalSeatsByTierId(tier.getTierId());
                        Integer tierAvailableSeats = seatRepository.countAvailableSeatsByTierId(tier.getTierId());

                        // Chống NullPointerException
                        int safeTierTotal = tierTotalSeats != null ? tierTotalSeats : 0;
                        int safeTierAvail = tierAvailableSeats != null ? tierAvailableSeats : 0;

                        // 🌟 CỘNG DỒN LÊN ZONE
                        calculatedZoneTotalSeats += safeTierTotal;
                        calculatedZoneAvailableSeats += safeTierAvail;

                        tierResponses.add(new TierResponse(
                                tier.getTierId(),
                                tier.getTierName(),
                                tier.getPrice(),
                                tier.getCurrency(),
                                tier.getColorCode(),
                                tier.getDescription(),
                                tier.getDisplayOrder(),
                                rowPrefix,
                                rowCount,
                                seatsPerRow,
                                safeTierTotal,
                                safeTierAvail
                        ));
                    }
                }

                // 🌟 QUYẾT ĐỊNH LẤY SỐ NÀO:
                // Nếu là Zone ngồi (có sơ đồ) -> Lấy số đã cộng dồn từ các Tier
                // Nếu là Zone đứng (không sơ đồ) -> Lấy số lưu sẵn trong bảng Zone
                int finalTotalSeats = zone.isHasSeatMap() ? calculatedZoneTotalSeats : zone.getTotalSeats();
                int finalAvailableSeats = zone.isHasSeatMap() ? calculatedZoneAvailableSeats : zone.getAvailableSeats();

                // 2. Nhét vào trong ZoneResponse
                return new ZoneResponse(
                        zone.getZoneId(),
                        zone.getZoneName(),
                        zone.getPrice(),
                        zone.getCurrency(),
                        finalTotalSeats,       // 👈 Đã fix: Trả về số cộng dồn
                        finalAvailableSeats,   // 👈 Đã fix: Trả về số cộng dồn
                        zone.getColorCode(),
                        zone.isHasSeatMap(),
                        zone.getDisplayOrder(),
                        tierResponses
                );
            }).collect(Collectors.toList());
        }

        return ConcertResponse.builder()
                // ... (phần dưới của ông giữ nguyên y chang)
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
                .organizerId(concert.getOrganizer().getUserId())
                .organizerName(concert.getOrganizer().getName())
                .venueId(concert.getVenue().getVenueId())
                .venueName(concert.getVenue().getVenueName())
                .layoutConfig(concert.getLayoutConfig())
                .zones(zoneResponses)
                .build();
    }

    // 1 - create
    @Transactional
    public ConcertResponse createConcert(ConcertRequest concertRequest) {

        // ==========================================
        // ⏰ 1. KIỂM TRA RÀNG BUỘC THỜI GIAN (TIME LOGIC)
        // ==========================================

        LocalDateTime now = LocalDateTime.now();

        // [THÊM MỚI]: Sự kiện và thời gian bán vé phải ở tương lai
        if (concertRequest.getSaleStartAt().isBefore(now)) {
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Lỗi: Thời gian mở bán vé không được nằm trong quá khứ!");
        }
        if (concertRequest.getConcertDate().isBefore(now)) {
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Lỗi: Thời gian diễn ra sự kiện không được nằm trong quá khứ!");
        }

        // Logic Bán vé: Thời gian mở bán phải hợp lý (saleStartAt < saleEndAt)
        if (!concertRequest.getSaleStartAt().isBefore(concertRequest.getSaleEndAt())) {
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Lỗi: Thời gian mở bán vé phải diễn ra TRƯỚC thời gian đóng bán!");
        }

        // Logic Sự kiện: Ngày kết thúc phải sau Ngày bắt đầu (concertDate < endDate)
        if (!concertRequest.getConcertDate().isBefore(concertRequest.getEndDate())) {
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Lỗi: Thời gian bắt đầu sự kiện phải diễn ra TRƯỚC thời gian kết thúc!");
        }

        // Logic Chéo: Đóng cửa bán vé trước khi hát (saleEndAt <= concertDate)
        if (concertRequest.getSaleEndAt().isAfter(concertRequest.getConcertDate())) {
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Lỗi: Phải kết thúc đóng cửa bán vé TRƯỚC HOẶC ĐÚNG LÚC sự kiện bắt đầu!");
        }

        // ==========================================
        // 🏢 2. KIỂM TRA ĐỊA ĐIỂM & ĐỤNG LỊCH (VENUE LOGIC)
        // ==========================================

        Venue venue = venueRepository.findById(concertRequest.getVenueId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy địa điểm tổ chức với ID: " + concertRequest.getVenueId()));

        // [THÊM MỚI]: Kiểm tra trùng lịch sân khấu
        boolean isBusy = concertRepository.existsOverlappingConcert(
                venue.getVenueId(),
                concertRequest.getConcertDate(),
                concertRequest.getEndDate()
        );
        if (isBusy) {
            throw new CustomException(HttpStatus.CONFLICT.value(), "Lỗi: Địa điểm này đã có sự kiện khác được lên lịch trong khoảng thời gian này!");
        }

        // Thiết lập thông tin Concert
        Concert concert = new Concert();
        concert.setTitle(concertRequest.getTitle());
        concert.setArtist(concertRequest.getArtist());
        concert.setConcertDate(concertRequest.getConcertDate());
        concert.setEndDate(concertRequest.getEndDate());
        concert.setDescription(concertRequest.getDescription());
        concert.setBannerURL(concertRequest.getBannerURL());
        concert.setSaleStartAt(concertRequest.getSaleStartAt());
        concert.setSaleEndAt(concertRequest.getSaleEndAt());
        concert.setStatus(concertRequest.getStatus());
        concert.setLayoutConfig(concertRequest.getLayoutConfig());
        concert.setVenue(venue);

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        User organizer = userRepository.findById(UUID.fromString(currentUserId))
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy thông tin Admin"));
        concert.setOrganizer(organizer);

        Concert savedConcert = concertRepository.save(concert);

        // ==========================================
        // 💺 3. XỬ LÝ LƯU ZONE, TIER VÀ KIỂM SOÁT SỨC CHỨA
        // ==========================================
        if (concertRequest.getZones() != null && !concertRequest.getZones().isEmpty()) {
            List<Zone> zonesToSave = new ArrayList<>();
            List<Seat> allSeatsToSave = new ArrayList<>();

            int grandTotalSeats = 0; // [THÊM MỚI]: Biến cộng dồn tổng số vé của toàn bộ sự kiện

            for (ZoneRequest zReq : concertRequest.getZones()) {
                Zone zone = new Zone();
                zone.setConcert(savedConcert);
                zone.setZoneName(zReq.getZoneName());
                zone.setPrice(zReq.getPrice());
                zone.setCurrency(zReq.getCurrency());
                zone.setColorCode(zReq.getColorCode());
                zone.setHasSeatMap(zReq.getHasSeatMap() != null ? zReq.getHasSeatMap() : false);
                zone.setDisplayOrder(zReq.getDisplayOrder());
                zone.setStatus("ACTIVE");
                zone.setSoldSeats(0);

                if (zone.isHasSeatMap() && zReq.getTiers() != null && !zReq.getTiers().isEmpty()) {
                    int totalSeatsForZone = 0;
                    Zone savedZone = zoneRepository.save(zone);
                    zonesToSave.add(savedZone);

                    for (com.example.tttnbe.seat.dto.TierRequest tReq : zReq.getTiers()) {
                        // [THÊM MỚI]: Chặn spam tạo quá nhiều ghế gây sập server (Giới hạn ví dụ: 5000 ghế/tier)
                        int seatsInTier = tReq.getRowCount() * tReq.getSeatsPerRow();
                        if (seatsInTier > 5000) {
                            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Lỗi: Không được tạo quá 5000 ghế trong một Hạng vé (Tier) để đảm bảo hiệu suất!");
                        }

                        com.example.tttnbe.seat.entity.SeatTier tier = new com.example.tttnbe.seat.entity.SeatTier();
                        tier.setZone(savedZone);
                        tier.setTierName(tReq.getTierName());
                        tier.setPrice(tReq.getPrice());
                        tier.setCurrency(tReq.getCurrency() != null ? tReq.getCurrency() : "USDT");
                        tier.setColorCode(tReq.getColorCode());
                        tier.setDescription(tReq.getDescription());
                        tier.setDisplayOrder(tReq.getDisplayOrder() != null ? tReq.getDisplayOrder() : 1);

                        SeatTier savedTier = seatTierRepository.save(tier);
                        totalSeatsForZone += seatsInTier;
                        grandTotalSeats += seatsInTier; // Cộng vào tổng sự kiện

                        String prefix = (tReq.getRowPrefix() != null && !tReq.getRowPrefix().isBlank())
                                ? tReq.getRowPrefix().toUpperCase() : "A";
                        int startIndex = rowLabelToNumber(prefix);

                        for (int i = 0; i < tReq.getRowCount(); i++) {
                            String currentRow = numberToRowLabel(startIndex + i);
                            for (int j = 1; j <= tReq.getSeatsPerRow(); j++) {
                                Seat seat = new Seat();
                                seat.setZone(savedZone);
                                seat.setSeatTier(savedTier);
                                seat.setRowLabel(currentRow);
                                seat.setSeatNumber(j);
                                seat.setSeatLabel(currentRow + j);
                                seat.setStatus("AVAILABLE");

                                allSeatsToSave.add(seat);
                            }
                        }
                    }
                    savedZone.setTotalSeats(totalSeatsForZone);
                    savedZone.setAvailableSeats(totalSeatsForZone);
                    zoneRepository.save(savedZone);

                } else {
                    int standingSeats = zReq.getTotalSeats() != null ? zReq.getTotalSeats() : 0;
                    zone.setTotalSeats(standingSeats);
                    zone.setAvailableSeats(standingSeats);
                    grandTotalSeats += standingSeats; // Cộng vé đứng vào tổng sự kiện

                    Zone savedZone = zoneRepository.save(zone);
                    zonesToSave.add(savedZone);
                }
            }

            // [THÊM MỚI]: Kiểm tra tổng số vé tạo ra có vượt sức chứa sân khấu không?
            if (grandTotalSeats > venue.getCapacity()) {
                throw new CustomException(HttpStatus.BAD_REQUEST.value(),
                        "Lỗi: Tổng số vé (" + grandTotalSeats + ") vượt quá sức chứa tối đa của địa điểm (" + venue.getCapacity() + " người)!");
            }

            savedConcert.setZones(zonesToSave);

            if (!allSeatsToSave.isEmpty()) {
                seatRepository.saveAll(allSeatsToSave);
            }
        }

        return mapToResponse(savedConcert);
    }

    //2 - getAll co phan trang
    public PageResponse<ConcertResponse> getAllConcerts(int page, int size, String keyword, UUID venueId, String status) {

        int currentPage = (page > 0) ? page - 1 : 0;
        Pageable pageable = PageRequest.of(currentPage, size, Sort.by("createdAt").descending());

        Page<Concert> concertPage = concertRepository.searchConcerts(keyword, venueId, status, pageable);

        Page<ConcertResponse> dtoPage = concertPage.map(this::mapToResponse);

        return PageResponse.from(dtoPage);
    }

    //3 - getById
    @Transactional
    public ConcertResponse getConcert(UUID concertId) {
        Concert concert = concertRepository.findById(concertId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy concert với ID: " + concertId));

        return mapToResponse(concert);
    }

    // 4 - update
    @Transactional
    public ConcertResponse updateConcert(UUID concertId, UpdateConcertRequest concertRequest) {
        // ==========================================
        // 🛡️ LỚP PHÒNG THỦ 2.1: RÀNG BUỘC THỜI GIAN (TIME LOGIC)
        // ==========================================
        if (concertRequest.getSaleStartAt().isAfter(concertRequest.getSaleEndAt()) ||
                concertRequest.getSaleStartAt().isEqual(concertRequest.getSaleEndAt())) {
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Lỗi: Thời gian mở bán vé phải diễn ra TRƯỚC thời gian đóng bán!");
        }

        if (concertRequest.getConcertDate().isAfter(concertRequest.getEndDate()) ||
                concertRequest.getConcertDate().isEqual(concertRequest.getEndDate())) {
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Lỗi: Thời gian bắt đầu sự kiện phải diễn ra TRƯỚC thời gian kết thúc!");
        }

        if (concertRequest.getSaleEndAt().isAfter(concertRequest.getConcertDate())) {
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Lỗi: Phải kết thúc đóng cửa bán vé TRƯỚC HOẶC ĐÚNG LÚC sự kiện bắt đầu!");
        }

        // ==========================================
        // 🛡️ LỚP PHÒNG THỦ 2.2: BẪY ĐỤNG SHOW KHI UPDATE
        // ==========================================
        // Khác với Create, khi Update ta phải DẶN DATABASE LÀ:
        // "Tìm xem có ai đụng show không, nhưng NHỚ LOẠI TRỪ CHÍNH CÁI CONCERT NÀY RA NHÉ!"
        // (Nếu không loại trừ, nó sẽ báo đụng show với chính nó)
        boolean isVenueBooked = concertRepository.existsByVenueIdAndDateOverlapForUpdate(
                concertRequest.getVenueId(),
                concertRequest.getConcertDate(),
                concertRequest.getEndDate(),
                concertId // 👈 Truyền ID hiện tại vào để loại trừ
        );
        if (isVenueBooked) {
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Địa điểm này đã có một sự kiện khác đặt lịch trong khung giờ này!");
        }

        // 1. Tìm Concert cũ trong DB
        Concert concert = concertRepository.findById(concertId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy concert với ID: " + concertId));

        // 2. Cập nhật các thông tin cơ bản
        concert.setTitle(concertRequest.getTitle());
        concert.setArtist(concertRequest.getArtist());
        concert.setConcertDate(concertRequest.getConcertDate());
        concert.setEndDate(concertRequest.getEndDate());
        concert.setDescription(concertRequest.getDescription());
        concert.setBannerURL(concertRequest.getBannerURL());
        concert.setSaleStartAt(concertRequest.getSaleStartAt());
        concert.setSaleEndAt(concertRequest.getSaleEndAt());
        concert.setStatus(concertRequest.getStatus());
        concert.setLayoutConfig(concertRequest.getLayoutConfig());

        // Kiểm tra và cập nhật địa điểm (Venue) nếu có thay đổi
        if (!concert.getVenue().getVenueId().equals(concertRequest.getVenueId())) {
            Venue venue = venueRepository.findById(concertRequest.getVenueId())
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy địa điểm tổ chức"));
            concert.setVenue(venue);
        }

        // 3. XỬ LÝ SƠ ĐỒ GHẾ (ZONES / TIERS / SEATS)
        if (concertRequest.getZones() != null && !concertRequest.getZones().isEmpty()) {

            // KIỂM TRA LUẬT THÉP: Đã bán vé chưa?
            long soldTickets = ticketRepository.countByConcert_ConcertId(concertId);

            if (soldTickets > 0) {
                // Đã bán vé -> Chặn đứng hành động sửa sơ đồ ghế!
                throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Concert này đã có vé được bán ra! Bạn chỉ được sửa thông tin cơ bản, KHÔNG THỂ thay đổi sơ đồ khu vực và hạng vé.");
            } else {
                // Chưa bán vé -> Cho phép "Đập đi xây lại" (Trùm cuối trị Hibernate)

                // BƯỚC 1: Ép Hibernate XÓA ĐÍCH DANH thay vì lén lút Update NULL
                if (concert.getZones() != null && !concert.getZones().isEmpty()) {
                    for (Zone oldZone : concert.getZones()) {

                        // 1. Xóa sạch Ghế bằng ID (Vì Ghế không có list con nên an toàn)
                        seatRepository.deleteByZone_ZoneId(oldZone.getZoneId());

                        // 2. Dùng hàm deleteAll(entities) để BẮT BUỘC Hibernate phát lệnh DELETE Hạng vé
                        if (oldZone.getSeatTiers() != null && !oldZone.getSeatTiers().isEmpty()) {
                            seatTierRepository.deleteAll(oldZone.getSeatTiers());
                        }
                    }

                    // 3. BẮT BUỘC Hibernate phát lệnh DELETE toàn bộ Khu vực cũ
                    zoneRepository.deleteAll(concert.getZones());

                    // 4. Clear túi RAM để chuẩn bị nhét Zone mới vào (Không bị lỗi Orphan nữa)
                    concert.getZones().clear();
                }

                // BƯỚC 2: Ép Database dội sạch rác ngay lập tức để trống chỗ
                concertRepository.flush();

                // BƯỚC 3: Lưu thông tin cơ bản
                Concert savedConcert = concertRepository.save(concert);

                // BƯỚC 4: XÂY LẠI SƠ ĐỒ MỚI (Bắt đầu vòng lặp List<Zone> zonesToSave = new ArrayList<>(); ...)
                // ---> (Phần code lặp tạo Zone và Seat ở dưới của bạn GIỮ NGUYÊN KHÔNG ĐỔI)
                List<Zone> zonesToSave = new ArrayList<>();
                List<Seat> allSeatsToSave = new ArrayList<>();

                for (ZoneRequest zReq : concertRequest.getZones()) {
                    Zone zone = new Zone();
                    zone.setConcert(savedConcert);
                    zone.setZoneName(zReq.getZoneName());
                    zone.setPrice(zReq.getPrice());
                    zone.setCurrency(zReq.getCurrency());
                    zone.setColorCode(zReq.getColorCode());
                    zone.setHasSeatMap(zReq.getHasSeatMap() != null ? zReq.getHasSeatMap() : false);
                    zone.setDisplayOrder(zReq.getDisplayOrder());
                    zone.setStatus("ACTIVE");
                    zone.setSoldSeats(0);

                    if (zone.isHasSeatMap() && zReq.getTiers() != null && !zReq.getTiers().isEmpty()) {
                        int totalSeatsForZone = 0;
                        Zone savedZone = zoneRepository.save(zone);
                        zonesToSave.add(savedZone);

                        for (com.example.tttnbe.seat.dto.TierRequest tReq : zReq.getTiers()) {
                            com.example.tttnbe.seat.entity.SeatTier tier = new com.example.tttnbe.seat.entity.SeatTier();
                            tier.setZone(savedZone);
                            tier.setTierName(tReq.getTierName());
                            tier.setPrice(tReq.getPrice());
                            tier.setCurrency(tReq.getCurrency() != null ? tReq.getCurrency() : "USDT");
                            tier.setColorCode(tReq.getColorCode());
                            tier.setDescription(tReq.getDescription());
                            tier.setDisplayOrder(tReq.getDisplayOrder() != null ? tReq.getDisplayOrder() : 1);

                            com.example.tttnbe.seat.entity.SeatTier savedTier = seatTierRepository.save(tier);

                            int seatsInTier = tReq.getRowCount() * tReq.getSeatsPerRow();
                            totalSeatsForZone += seatsInTier;

                            String prefix = (tReq.getRowPrefix() != null && !tReq.getRowPrefix().isBlank()) ? tReq.getRowPrefix().toUpperCase() : "A";
                            int startIndex = rowLabelToNumber(prefix);

                            for (int i = 0; i < tReq.getRowCount(); i++) {
                                String currentRow = numberToRowLabel(startIndex + i);
                                for (int j = 1; j <= tReq.getSeatsPerRow(); j++) {
                                    Seat seat = new Seat();
                                    seat.setZone(savedZone);
                                    seat.setSeatTier(savedTier);
                                    seat.setRowLabel(currentRow);
                                    seat.setSeatNumber(j);
                                    seat.setSeatLabel(currentRow + j);
                                    seat.setStatus("AVAILABLE");
                                    allSeatsToSave.add(seat);
                                }
                            }
                        }
                        savedZone.setTotalSeats(totalSeatsForZone);
                        savedZone.setAvailableSeats(totalSeatsForZone);
                        zoneRepository.save(savedZone);

                    } else {
                        // Vé đứng
                        zone.setTotalSeats(zReq.getTotalSeats() != null ? zReq.getTotalSeats() : 0);
                        zone.setAvailableSeats(zReq.getTotalSeats() != null ? zReq.getTotalSeats() : 0);
                        Zone savedZone = zoneRepository.save(zone);
                        zonesToSave.add(savedZone);
                    }
                }

                // CHỈNH SỬA LẠI ĐOẠN GẮN ZONES VÀO CONCERT
                if (savedConcert.getZones() != null) {
                    savedConcert.getZones().clear(); // Xóa rỗng cái túi của Hibernate
                    savedConcert.getZones().addAll(zonesToSave); // Đổ dữ liệu mới vào lại cái túi đó
                } else {
                    savedConcert.setZones(zonesToSave); // (Chỉ dùng set khi ban đầu nó thực sự Null)
                }

                if (!allSeatsToSave.isEmpty()) {
                    seatRepository.saveAll(allSeatsToSave);
                }

                return mapToResponse(savedConcert);
            }
        }

        // Nếu FE không gửi danh sách zones lên (chỉ cập nhật thông tin cơ bản)
        Concert savedConcert = concertRepository.save(concert);
        return mapToResponse(savedConcert);
    }

    // 5 - delete (Kết hợp Hard Delete và Soft Delete)
    @Transactional
    public void deleteConcert(UUID concertId) {
        Concert concert = concertRepository.findById(concertId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy concert với ID: " + concertId));

        // Kiểm tra xem sự kiện này đã bị hủy từ trước chưa
        if ("CANCELLED".equals(concert.getStatus())) {
            throw new CustomException(HttpStatus.BAD_REQUEST.value(), "Sự kiện này đã bị hủy từ trước rồi!");
        }

        // KIỂM TRA LUẬT THÉP: Đã có ai mua vé chưa?
        long soldTickets = ticketRepository.countByConcert_ConcertId(concertId);

        if (soldTickets == 0) {

            zoneRepository.deleteByConcert_ConcertId(concertId);

            // Cuối cùng là xóa luôn Concert này cho DB sạch sẽ
            concertRepository.delete(concert);

        } else {
            // ==========================================
            // TRƯỜNG HỢP 2: ĐÃ BÁN VÉ -> SOFT DELETE (HỦY SHOW)
            // ==========================================
            // Đổi trạng thái Concert thành CANCELLED
            concert.setStatus("CANCELLED");
            concertRepository.save(concert);

            // 💡 GHI CHÚ CHO BẠN PHÁT TRIỂN TIẾP (Tùy chọn):
            /*
             * Chỗ này sau này bạn có thể viết thêm code để:
             * 1. Cập nhật toàn bộ vé (Tickets) của Concert này thành trạng thái "REVOKED" (Đã thu hồi).
             * 2. Gọi Smart Contract để đốt (Burn) NFT Tickets trên Blockchain.
             * 3. Bắn event sang hệ thống Payment để tự động Refund (Hoàn tiền) cho User.
             * 4. Gửi Email hàng loạt xin lỗi khách hàng.
             */
        }
    }

    //6 - update status thanh "ON_SALE" khi admin nhan "Mo ban"
    @Transactional
    public ConcertResponse updateConcertStatus(UUID concertId, UpdateStatusRequest request) {
        Concert concert = concertRepository.findById(concertId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy concert với ID: " + concertId));

        concert.setStatus(request.getStatus());
        Concert savedConcert = concertRepository.save(concert);

        return mapToResponse(savedConcert);
    }

    @Override
    public PageResponse<TicketListItemResponse> getTicketsByConcertId(UUID concertId, int page, int size) {
        // 1. Kiểm tra xem Concert có tồn tại không
        concertRepository.findById(concertId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy concert với ID: " + concertId));

        // 2. Tạo cấu hình phân trang (chú ý: Spring Boot đếm trang từ 0)
        Pageable pageable = PageRequest.of(page, size);

        // 3. Móc dữ liệu từ Database lên (trả về Page của Spring)
        Page<TicketListItemResponse> ticketPage = ticketRepository.findTicketsByConcertId(concertId, pageable);

        // 4. Dùng class PageResponse của bạn để "biến hình" cục data trả về JSON đẹp mắt
        return PageResponse.from(ticketPage);
    }

    // Hàm 1: Chuyển ký tự hàng thành số (A -> 1, Z -> 26, AA -> 27)
    private int rowLabelToNumber(String label) {
        int result = 0;
        for (int i = 0; i < label.length(); i++) {
            result = result * 26 + (label.charAt(i) - 'A' + 1);
        }
        return result;
    }

    // Hàm 2: Chuyển số thành ký tự hàng chuẩn Excel (1 -> A, 27 -> AA)
    private String numberToRowLabel(int number) {
        StringBuilder label = new StringBuilder();
        while (number > 0) {
            number--; // Lùi về 1 đơn vị để khớp với hệ cơ số 0
            label.append((char) ('A' + (number % 26)));
            number /= 26;
        }
        return label.reverse().toString();
    }
}
