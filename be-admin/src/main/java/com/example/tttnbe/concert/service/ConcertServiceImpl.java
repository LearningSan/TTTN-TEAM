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

                // 1. Móc danh sách Tiers từ trong Zone ra và biến thành TierResponse
                List<TierResponse> tierResponses = null;

                // (⚠️ Đảm bảo trong Entity Zone của bạn đã có quan hệ:
                // @OneToMany(mappedBy = "zone", cascade = CascadeType.ALL) private List<SeatTier> seatTiers;)
                if (zone.getSeatTiers() != null && !zone.getSeatTiers().isEmpty()) {
                    tierResponses = zone.getSeatTiers().stream().map(tier -> new com.example.tttnbe.seat.dto.TierResponse(
                            tier.getTierId(),
                            tier.getTierName(),
                            tier.getPrice(),
                            tier.getCurrency(),
                            tier.getColorCode(),
                            tier.getDescription(),
                            tier.getDisplayOrder()
                    )).collect(Collectors.toList());
                }

                // 2. Nhét Tiers vào trong ZoneResponse
                return new ZoneResponse(
                        zone.getZoneId(),
                        zone.getZoneName(),
                        zone.getPrice(),
                        zone.getCurrency(),
                        zone.getTotalSeats(),
                        zone.getAvailableSeats(),
                        zone.getColorCode(),
                        zone.isHasSeatMap(),
                        zone.getDisplayOrder(),
                        tierResponses
                );
            }).collect(Collectors.toList());
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
                // Lấy nhẹ cái id, tên của Organizer và Venue
                .organizerId(concert.getOrganizer().getUserId())
                .organizerName(concert.getOrganizer().getName())
                .venueId(concert.getVenue().getVenueId())
                .venueName(concert.getVenue().getVenueName())
                .zones(zoneResponses)
                .build();
    }

    // 1 - create
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
        concert.setStatus(concertRequest.getStatus());

        // Tìm organizer trong security
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        User organizer = userRepository.findById(UUID.fromString(currentUserId))
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy thông tin Admin (ID: " + currentUserId + ")"));
        concert.setOrganizer(organizer);

        // Tìm venue
        Venue venue = venueRepository.findById(concertRequest.getVenueId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy địa điểm tổ chức với ID: " + concertRequest.getVenueId()));
        concert.setVenue(venue);

        // Lưu concert để lấy ID
        Concert savedConcert = concertRepository.save(concert);

        // XỬ LÝ LƯU ZONE VÀ TIER VÀ SEAT
        if (concertRequest.getZones() != null && !concertRequest.getZones().isEmpty()) {
            List<Zone> zonesToSave = new ArrayList<>();
            List<Seat> allSeatsToSave = new ArrayList<>();

            for (ZoneRequest zReq : concertRequest.getZones()) {
                Zone zone = new Zone();
                zone.setConcert(savedConcert);
                zone.setZoneName(zReq.getZoneName());
                zone.setPrice(zReq.getPrice()); // Dành cho vé đứng
                zone.setCurrency(zReq.getCurrency());
                zone.setColorCode(zReq.getColorCode());
                zone.setHasSeatMap(zReq.getHasSeatMap() != null ? zReq.getHasSeatMap() : false);
                zone.setDisplayOrder(zReq.getDisplayOrder());
                zone.setStatus("ACTIVE");
                zone.setSoldSeats(0);

                // NẾU CÓ SƠ ĐỒ GHẾ VÀ CÓ TRUYỀN TIERS
                if (zone.isHasSeatMap() && zReq.getTiers() != null && !zReq.getTiers().isEmpty()) {
                    int totalSeatsForZone = 0;

                    // Lưu Zone trước để lấy ID gắn vào Tier
                    Zone savedZone = zoneRepository.save(zone);
                    zonesToSave.add(savedZone);

                    // 🌟 VÒNG LẶP MỚI: QUÉT QUA TỪNG HẠNG VÉ (TIER)
                    for (com.example.tttnbe.seat.dto.TierRequest tReq : zReq.getTiers()) {
                        // 1. Tạo và lưu Hạng vé (Tier)
                        com.example.tttnbe.seat.entity.SeatTier tier = new com.example.tttnbe.seat.entity.SeatTier();
                        tier.setZone(savedZone);
                        tier.setConcert(savedConcert);
                        tier.setTierName(tReq.getTierName());
                        tier.setPrice(tReq.getPrice());
                        tier.setCurrency(tReq.getCurrency() != null ? tReq.getCurrency() : "USDT");
                        tier.setColorCode(tReq.getColorCode());
                        tier.setDescription(tReq.getDescription());
                        tier.setDisplayOrder(tReq.getDisplayOrder() != null ? tReq.getDisplayOrder() : 1);

                        com.example.tttnbe.seat.entity.SeatTier savedTier = seatTierRepository.save(tier);

                        // 2. Logic sinh ghế chuẩn Excel cho Tier này
                        int seatsInTier = tReq.getRowCount() * tReq.getSeatsPerRow();
                        totalSeatsForZone += seatsInTier;

                        String prefix = (tReq.getRowPrefix() != null && !tReq.getRowPrefix().isBlank())
                                ? tReq.getRowPrefix().toUpperCase() : "A";
                        int startIndex = rowLabelToNumber(prefix);

                        for (int i = 0; i < tReq.getRowCount(); i++) {
                            String currentRow = numberToRowLabel(startIndex + i);

                            for (int j = 1; j <= tReq.getSeatsPerRow(); j++) {
                                Seat seat = new Seat();
                                seat.setZone(savedZone);
                                seat.setConcert(savedConcert);
                                seat.setSeatTier(savedTier); // 👈 Quan trọng: Gắn ghế vào Tier
                                seat.setRowLabel(currentRow);
                                seat.setSeatNumber(j);
                                seat.setSeatLabel(currentRow + j);
                                seat.setStatus("AVAILABLE");

                                allSeatsToSave.add(seat);
                            }
                        }
                    }

                    // Cập nhật lại tổng số ghế của Zone
                    savedZone.setTotalSeats(totalSeatsForZone);
                    savedZone.setAvailableSeats(totalSeatsForZone);
                    zoneRepository.save(savedZone);

                } else {
                    // NẾU LÀ VÉ ĐỨNG (Không có sơ đồ ghế)
                    zone.setTotalSeats(zReq.getTotalSeats() != null ? zReq.getTotalSeats() : 0);
                    zone.setAvailableSeats(zReq.getTotalSeats() != null ? zReq.getTotalSeats() : 0);

                    Zone savedZone = zoneRepository.save(zone);
                    zonesToSave.add(savedZone);
                }
            }

            savedConcert.setZones(zonesToSave);

            // Lưu toàn bộ ghế xuống DB trong 1 câu lệnh (Tối ưu performance)
            if (!allSeatsToSave.isEmpty()) {
                seatRepository.saveAll(allSeatsToSave);
            }
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
    @Transactional
    public ConcertResponse getConcert(UUID concertId) {
        Concert concert = concertRepository.findById(concertId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy concert với ID: " + concertId));

        return mapToResponse(concert);
    }

    // 4 - update
    @Transactional
    public ConcertResponse updateConcert(UUID concertId, UpdateConcertRequest concertRequest) {
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
                // Chưa bán vé -> Cho phép "Đập đi xây lại"

                // BƯỚC 3.1: Xóa sạch dữ liệu cũ (Phải xóa từ dưới lên để không lỗi khóa ngoại)
                seatRepository.deleteByConcert_ConcertId(concertId);
                seatTierRepository.deleteByConcert_ConcertId(concertId);
                zoneRepository.deleteByConcert_ConcertId(concertId);

                // Lấy Concert sau khi đã lưu thông tin cơ bản để gắn vào Zone mới
                Concert savedConcert = concertRepository.save(concert);

                // BƯỚC 3.2: Xây lại sơ đồ mới (Copy y chang logic từ hàm Create)
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
                            tier.setConcert(savedConcert);
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
                                    seat.setConcert(savedConcert);
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

                if (savedConcert.getZones() != null) {
                    // Xóa sạch bộ nhớ tạm của Hibernate về danh sách cũ
                    savedConcert.getZones().clear();
                    // Bơm danh sách mới vào (Hibernate sẽ tự hiểu là update)
                    savedConcert.getZones().addAll(zonesToSave);
                } else {
                    savedConcert.setZones(zonesToSave);
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
            // ==========================================
            // TRƯỜNG HỢP 1: CHƯA BÁN VÉ -> HARD DELETE
            // ==========================================
            // Quét sạch rác trong DB từ dưới lên trên để không lỗi khóa ngoại
            seatRepository.deleteByConcert_ConcertId(concertId);
            seatTierRepository.deleteByConcert_ConcertId(concertId);
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
