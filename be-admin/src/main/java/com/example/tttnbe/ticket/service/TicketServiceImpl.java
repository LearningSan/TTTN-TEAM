package com.example.tttnbe.ticket.service;

import com.example.tttnbe.auth.entity.User;
import com.example.tttnbe.auth.repository.UserRepository;
import com.example.tttnbe.common.exception.CustomException;
import com.example.tttnbe.common.response.PageResponse;
import com.example.tttnbe.concert.entity.Concert;
import com.example.tttnbe.concert.repository.ConcertRepository;
import com.example.tttnbe.order.entity.Order;
import com.example.tttnbe.order.entity.OrderItem;
import com.example.tttnbe.order.repository.OrderItemRepository;
import com.example.tttnbe.order.repository.OrderRepository;
import com.example.tttnbe.payment.entity.PaymentTransaction;
import com.example.tttnbe.payment.repository.PaymentRepository;
import com.example.tttnbe.seat.entity.Seat;
import com.example.tttnbe.seat.repository.SeatRepository;
import com.example.tttnbe.ticket.dto.TicketDetailResponse;
import com.example.tttnbe.ticket.dto.TicketRequest;
import com.example.tttnbe.ticket.dto.TicketResponse;
import com.example.tttnbe.ticket.dto.TicketUpdateRequest;
import com.example.tttnbe.ticket.entity.Ticket;
import com.example.tttnbe.ticket.repository.TicketRepository;
import com.example.tttnbe.zone.entity.Zone;
import com.example.tttnbe.zone.repository.ZoneRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TicketServiceImpl implements TicketService{

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ConcertRepository concertRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private SeatRepository seatRepository;
    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private ZoneRepository zoneRepository;

    //dung chung - bien entity thanh dto
    private TicketResponse mapToResponse(Ticket ticket) {
        return TicketResponse.builder()
                .ticketId(ticket.getTicketId())
                .concertId(ticket.getConcert().getConcertId())
                .tokenId(ticket.getTokenId())
                .walletAddress(ticket.getWalletAddress())
                .status(ticket.getStatus())
                .purchaseDate(ticket.getPurchaseDate())
                .concertTitle(ticket.getConcert().getTitle())
                .zoneName(ticket.getZone().getZoneName())
                .seatLabel(ticket.getSeat() != null ? ticket.getSeat().getSeatLabel() : "Vé Đứng")
                .mintTx(ticket.getMintTx())
                .contractAddress(ticket.getContractAddress())
                .qrCode(ticket.getQrCode())
                .qrURL(ticket.getQrURL())
                .usedAt(ticket.getUsedAt())
                .build();
    }

    //1 - create
    public TicketResponse createTicket(TicketRequest ticketRequest) {
        Ticket ticket = new Ticket();

        ticket.setWalletAddress(ticketRequest.getWalletAddress());
        ticket.setStatus("MINTING"); //mac dinh khi moi mua ve - cho tao NFT
        ticket.setPurchaseDate(LocalDateTime.now());
        ticket.setTokenId("TEMP-" + UUID.randomUUID().toString()); //tam thoi

        //tim nguoi mua ve
        User user = userRepository.findById(ticketRequest.getUserId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy User"));
        ticket.setUser(user);

        //tim su kien cua ve nay
        Concert concert = concertRepository.findById(ticketRequest.getConcertId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy Concert"));
        ticket.setConcert(concert);

        //tim khu vuc cua ve nay
        Zone zone = zoneRepository.findById(ticketRequest.getZoneId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy Zone"));
        ticket.setZone(zone);

        //tim don thanh toan cua ve nay
        Order order = orderRepository.findById(ticketRequest.getOrderId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy Order"));
        ticket.setOrder(order);

        //chi tiet don thanh toan
        OrderItem orderItem = orderItemRepository.findById(ticketRequest.getOrderItemId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy Order Item"));
        ticket.setOrderItem(orderItem);

        //tim thong tin giao dich
        PaymentTransaction payment = paymentRepository.findById(ticketRequest.getPaymentId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy Giao dịch thanh toán"));
        ticket.setPayment(payment);

        //ghe co the null - phai kiem tra
        if (ticketRequest.getSeatId() != null) {
            Seat seat = seatRepository.findById(ticketRequest.getSeatId())
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy Ghế ngồi"));
            ticket.setSeat(seat);
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        return mapToResponse(savedTicket);
    }

    //2 - getAll co phan trang
    public PageResponse<TicketResponse> getAllTickets(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Ticket> ticketPage = ticketRepository.findAll(pageable);

        Page<TicketResponse> dtoPage = ticketPage.map(this::mapToResponse);

        return PageResponse.from(dtoPage);
    }

    //3 - getById
    public TicketResponse getTicket(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy vé với ID này"));

        return mapToResponse(ticket);
    }

    //4 - update
    @Transactional
    public TicketResponse updateTicket(UUID ticketId, TicketUpdateRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy vé để update"));

        if (request.getStatus() != null) {
            ticket.setStatus(request.getStatus());

            //neu ve da duoc check - dong dau thoi gian su dung la hien tai
            if ("USED".equalsIgnoreCase(request.getStatus()) && ticket.getUsedAt() == null) {
                ticket.setUsedAt(LocalDateTime.now());
            }
        }

        if (request.getTokenId() != null) ticket.setTokenId(request.getTokenId());
        if (request.getMintTx() != null) ticket.setMintTx(request.getMintTx());
        if (request.getContractAddress() != null) ticket.setContractAddress(request.getContractAddress());
        if (request.getQrCode() != null) ticket.setQrCode(request.getQrCode());
        if (request.getQrURL() != null) ticket.setQrURL(request.getQrURL());

        ticketRepository.save(ticket);

        //goi ham getTicket o tren de tra ve json chi tiet ve da update
        return getTicket(ticketId);
    }

    // 5 - delete
    public void deleteTicket(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy vé để xóa"));
        ticketRepository.delete(ticket);
    }

    @Override
    public TicketDetailResponse getTicketDetail(UUID ticketId) {
        return ticketRepository.getFullTicketDetailById(ticketId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy vé với ID: " + ticketId));
    }
}
