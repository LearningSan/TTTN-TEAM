import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineTicket,
} from "react-icons/hi";
import { AiFillHome } from "react-icons/ai";
import { ethers } from "ethers";

const MyTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resalePrice, setResalePrice] = useState("");
  const navigate = useNavigate();
  const NFT_ABI = ["function approve(address to, uint256 tokenId) public"];
  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        setLoading(true);
        // 1. Lấy danh sách vé sở hữu như cũ
        const resUser = await axios.get(
          `${import.meta.env.VITE_API_URL}/ticket/user`,
          {
            params: { page: 1, pageSize: 50 },
            withCredentials: true,
          },
        );

        // 2. SỬA TẠI ĐÂY: Gọi API mới để lấy danh sách người đang mua (Transfer PENDING)
        const resTransfers = await axios.get(
          `${import.meta.env.VITE_API_URL}/resale/my-transfers`,
          {
            withCredentials: true,
          },
        );

        const myOrders = resUser.data?.data?.data || [];
        const pendingTransfers = resTransfers.data || []; // Danh sách từ API mới

        // 3. Hợp nhất dữ liệu
        const combinedTickets = myOrders.flatMap((order) =>
          (order.tickets || []).map((t) => {
            // Tìm transfer tương ứng với ticket_id này
            const transferData = pendingTransfers.find(
              (tr) => tr.ticket_id === t.ticket_id,
            );
            return {
              ...t,
              concert_info: order.concert,
              venue_info: order.venue,
              // Gán dữ liệu transfer trực tiếp vào đây
              resale_transfer: transferData,
            };
          }),
        );

        setTickets(combinedTickets);
      } catch (error) {
        console.error("Lỗi fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTickets();
  }, [navigate]);

  const handleListResale = async (ticket_id) => {
    try {
      setLoading(true);
      // Chỉ gửi ticket_id theo đúng tài liệu API bạn cung cấp
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/resale/list`,
        { ticket_id: ticket_id },
        { withCredentials: true },
      );

      if (response.data) {
        alert("Đã niêm yết vé lên sàn thành công!");
        window.location.reload(); // Reload để trạng thái vé chuyển sang TRANSFERRED
      }
    } catch (error) {
      console.error("Lỗi niêm yết:", error);
      // Hiển thị thông báo lỗi chi tiết từ Backend (ví dụ: vé không ở trạng thái ACTIVE)
      alert(
        "Lỗi: " + (error.response?.data?.message || "Không thể niêm yết vé"),
      );
    } finally {
      setLoading(false);
    }
  };
  const handleCancelResale = async (ticketId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn hủy yêu cầu chuyển nhượng và thu hồi vé này không?",
      )
    )
      return;

    try {
      // SỬA TẠI ĐÂY: Đổi '/ticket/cancel-resale' thành '/resale/cancel' theo tài liệu
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/resale/cancel`,
        { ticket_id: ticketId },
        { withCredentials: true },
      );

      // Kiểm tra phản hồi thực tế từ server
      if (response.data) {
        alert("Đã hủy và thu hồi vé về ví của bạn thành công!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Lỗi khi hủy pass vé:", error);
      // Hiển thị lỗi chi tiết từ Backend nếu có
      alert(
        error.response?.data?.message ||
          "Không thể hủy yêu cầu lúc này. Vui lòng thử lại sau.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-black uppercase mb-10 text-gray-800 italic border-l-8 border-[#8D1B1B] pl-4">
          My Tickets
        </h2>

        {loading ? (
          <div className="text-center py-20 font-bold">
            Loading your tickets...
          </div>
        ) : tickets.length > 0 ? (
          <div className="space-y-8">
            {tickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                className="relative bg-black rounded-[30px] overflow-hidden shadow-2xl border border-gray-800 mb-6"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Phần trái: Thông tin chính */}
                  <div className="flex-1 p-8 text-white border-r border-dashed border-gray-600 relative">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-[#8D1B1B] text-[10px] px-3 py-1 rounded-full font-black uppercase">
                        {ticket.status || "Confirmed"}
                      </span>
                      <span className="text-gray-500 text-[10px] font-mono">
                        #{ticket.order_id?.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xl font-black uppercase mb-4 tracking-tight">
                      {ticket.concert_info?.title || "Vé Concert"}
                    </h3>

                    <div className="space-y-2 text-xs text-gray-400 font-medium">
                      <p className="flex items-center gap-2">
                        <HiOutlineLocationMarker className="text-[#8D1B1B]" />{" "}
                        {ticket.venue_info?.name || "Địa điểm chưa cập nhật"}
                      </p>
                      <p className="flex items-center gap-2">
                        <HiOutlineCalendar className="text-[#8D1B1B]" />{" "}
                        {ticket.concert_info?.concert_date
                          ? new Date(
                              ticket.concert_info.concert_date,
                            ).toLocaleDateString("vi-VN")
                          : "Đang cập nhật"}
                      </p>
                      <p className="flex items-center gap-2">
                        <HiOutlineTicket className="text-[#8D1B1B]" /> Seat:{" "}
                        <span className="text-white font-bold">
                          {ticket.seat?.label || "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Phần phải: QR Code & Giá */}
                  <div className="w-full md:w-48 bg-[#1A1A1A] p-6 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-white p-2 rounded-lg mb-4">
                      <img
                        src={ticket.qr_url}
                        alt="Ticket QR"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[#8D1B1B] font-black text-sm">
                      {ticket.price?.unit_price
                        ? `${ticket.price.unit_price.toLocaleString()} đ`
                        : "0 đ"}
                    </p>
                  </div>
                </div>

                {/* Phần Đăng bán vé - Đưa xuống dưới cùng để giao diện gọn hơn */}
                <div className="flex flex-col gap-2 mt-4">
                  {/* TRƯỜNG HỢP 1: Vé đang chờ người bán xác thực ví (Approve) */}
                  {ticket.status === "TRANSFERRED" && (
                    <div className="flex flex-col gap-2 p-4 bg-[#1a1a1a] border-t border-dashed border-gray-700">
                      {ticket.status === "TRANSFERRED" && (
                        <div className="flex flex-col gap-2 p-4 bg-[#1a1a1a] border-t border-dashed border-gray-700">
                          {/* Quan trọng: Phải kiểm tra xem vé này ĐÃ CÓ người mua tạo transfer chưa */}
                          {ticket.resale_transfer ? (
                            <button
                              onClick={() =>
                                navigate("/payment", {
                                  state: {
                                    isResale: true,
                                    nftData: ticket.resale_transfer, // Dữ liệu từ API /resale/buy
                                    amount: 0,
                                  },
                                })
                              }
                              className="w-full bg-blue-600..."
                            >
                              👉 Mở Ví Xác Nhận Bán (Approve)
                            </button>
                          ) : (
                            <div className="text-center py-2 bg-gray-800 rounded-lg">
                              <p className="text-[10px] text-orange-400 font-black uppercase italic">
                                Đang chờ người mua thanh toán (tạo lệnh)...
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => handleCancelResale(ticket.ticket_id)}
                        className="w-full bg-transparent text-gray-500 text-[10px] font-bold py-2 hover:text-red-500 transition-colors"
                      >
                        Hủy yêu cầu & Thu hồi vé
                      </button>
                    </div>
                  )}

                  {/* TRƯỜNG HỢP 2: Vé đang ACTIVE (Chưa bán) */}
                  {ticket.status === "ACTIVE" && (
                    <button
                      onClick={() => handleListResale(ticket.ticket_id)}
                      className="bg-white text-black text-xs font-black py-3 rounded-xl uppercase border-2 border-gray-100 hover:border-[#8D1B1B] hover:bg-[#8D1B1B] hover:text-white transition-all shadow-md"
                    >
                      Pass lại vé
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">
              Bạn chưa có vé nào. Hãy khám phá các sự kiện mới!
            </p>
            <Link
              to="/"
              className="inline-block mt-4 bg-[#8D1B1B] text-white px-8 py-2 rounded-full font-black text-sm uppercase shadow-lg"
            >
              Go to Store
            </Link>
          </div>
        )}
      </main>

      <footer className="bg-[#F5F5F5] py-10 text-center border-t border-gray-200">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          © 2026 TICKETX.
        </p>
      </footer>
    </div>
  );
};

export default MyTicket;
