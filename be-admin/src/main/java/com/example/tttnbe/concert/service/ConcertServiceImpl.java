package com.example.tttnbe.concert.service;

import com.example.tttnbe.auth.entity.User;
import com.example.tttnbe.auth.repository.UserRepository;
import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.concert.dto.ConcertRequest;
import com.example.tttnbe.concert.dto.ConcertResponse;
import com.example.tttnbe.concert.entity.Concert;
import com.example.tttnbe.concert.repository.ConcertRepository;
import com.example.tttnbe.common.exception.CustomException;
import com.example.tttnbe.venue.entity.Venue;
import com.example.tttnbe.venue.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ConcertServiceImpl implements ConcertService {
    @Autowired
    private ConcertRepository concertRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VenueRepository venueRepository;

    //dung chung - bien entity thanh dto
    private ConcertResponse mapToResponse(Concert concert) {
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
                // Lấy nhẹ cái tên của Organizer và Venue ra thôi, không lấy cả cục
                .organizerName(concert.getOrganizer().getName())
                .venueName(concert.getVenue().getVenueName())
                .build();
    }

    //1 - create
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
    public ConcertResponse updateConcert(UUID concertId, ConcertRequest concertRequest) {
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
