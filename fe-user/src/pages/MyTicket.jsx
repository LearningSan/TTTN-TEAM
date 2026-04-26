import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineTicket,
} from "react-icons/hi";
import { AiFillHome } from "react-icons/ai";

const MyTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resalePrice, setResalePrice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyTickets = async () => {
      // 1. Kiểm tra đăng nhập trước khi gọi API
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (!savedUser) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/ticket/user`,
          {
            params: { page: 1, pageSize: 10 },
            withCredentials: true,
            timeout: 30000,
          },
        );

        // 2. Xử lý dữ liệu dựa trên JSON thực tế
        const orders = response.data?.data?.data || [];

        if (Array.isArray(orders)) {
          const allTickets = orders.flatMap((orderItem) =>
            (orderItem.tickets || []).map((t) => ({
              ...t,
              concert_info: orderItem.concert,
              venue_info: orderItem.venue,
              order_id: orderItem.order_id,
            })),
          );
          setTickets(allTickets);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách vé:", error);
        if (error.response?.status === 401) {
          navigate("/login"); // Nếu hết hạn phiên, bắt login lại
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyTickets();
  }, [navigate]);

  const handleListResale = async (ticketId, price) => {
    if (!price || price <= 0) {
      alert("Vui lòng nhập giá bán hợp lệ!");
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/resale/list`,
        { ticket_id: ticketId, price: Number(price) },
        { withCredentials: true },
      );

      if (response.data.success) {
        alert("Đã đăng bán vé thành công!");
        window.location.reload(); // Reload để cập nhật trạng thái
      }
    } catch (error) {
      alert(
        "Lỗi khi đăng bán: " + (error.response?.data?.message || "Thử lại sau"),
      );
    }
  };
  const handleCancelResale = async (ticketId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đăng bán vé này?")) return;
    try {
      // Giả sử API hủy là /resale/cancel hoặc tương tự
      await axios.post(
        `${import.meta.env.VITE_API_URL}/resale/cancel`,
        { ticket_id: ticketId },
        { withCredentials: true },
      );
      alert("Đã hủy đăng bán!");
      // Load lại danh sách vé
      window.location.reload();
    } catch (err) {
      alert(
        "Lỗi: " + (err.response?.data?.message || "Không thể hủy đăng bán"),
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
                <div className="bg-[#0a0a0a] p-4 flex justify-end items-center gap-3 border-t border-gray-900">
                  {ticket.status === "TRANSFERRED" ? (
                    <div className="flex items-center gap-4">
                      <span className="text-yellow-500 text-[10px] font-black uppercase animate-pulse">
                        • Đang treo bán trên sàn
                      </span>
                      <button
                        onClick={() => handleCancelResale(ticket.ticket_id)}
                        className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-lg uppercase hover:bg-red-700 transition-all shadow-lg"
                      >
                        Hủy đăng bán
                      </button>
                    </div>
                  ) : (
                    /* Nếu vé chưa đăng bán thì hiện ô nhập giá và nút Đăng bán */
                    <>
                      {/* <input
                        type="number"
                        id={`price-${ticket.ticket_id}`} // Gắn ID riêng cho mỗi input của mỗi vé
                        placeholder="Giá bán lại..."
                        className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg w-32 outline-none focus:ring-1 ring-[#8D1B1B]"
                      /> */}
                      <button
                        onClick={() =>
                          handleListResale(
                            ticket.ticket_id,
                            ticket.zone?.price || 0,
                          )
                        }
                        className="bg-white text-black text-[10px] font-black px-6 py-2 rounded-lg uppercase hover:bg-[#8D1B1B] hover:text-white transition-all shadow-lg active:scale-95"
                      >
                        Pass lại vé (Giá gốc)
                      </button>
                    </>
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
