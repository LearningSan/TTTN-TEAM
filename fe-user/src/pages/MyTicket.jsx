import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/ticket`,
          {},
          { withCredentials: true },
        );

        // Sửa ở đây: Server trả về mảng trực tiếp
        if (response.data && Array.isArray(response.data)) {
          setTickets(response.data);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách vé:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTickets();
  }, []);

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
                key={ticket.ticket_id} // Đổi order_id thành ticket_id
                className="relative flex flex-col md:flex-row bg-black rounded-[30px] overflow-hidden shadow-2xl border border-gray-800"
              >
                {/* Phần trái: Thông tin chính */}
                <div className="flex-1 p-8 text-white border-r border-dashed border-gray-600 relative">
                  {/* Rãnh cắt vé nghệ thuật */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full"></div>
                  <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-white rounded-full"></div>

                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-[#8D1B1B] text-[10px] px-3 py-1 rounded-full font-black uppercase">
                      Confirmed
                    </span>
                    <span className="text-gray-500 text-[10px] font-mono">
                      #{ticket.order_id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>

                  {/* Tìm đoạn này trong file MyTicket.jsx và sửa lại */}
                  <h3 className="text-xl font-black uppercase mb-4 tracking-tight">
                    {ticket.concert_title || ticket.title || "Vé Concert"}
                  </h3>

                  <div className="space-y-2 text-xs text-gray-400 font-medium">
                    <p className="flex items-center gap-2">
                      <HiOutlineLocationMarker className="text-[#8D1B1B]" />{" "}
                      {ticket.venue_name ||
                        ticket.location_name ||
                        "Sân vận động Mỹ Đình"}
                    </p>
                    <p className="flex items-center gap-2">
                      <HiOutlineCalendar className="text-[#8D1B1B]" />{" "}
                      {/* Thêm kiểm tra date để tránh lỗi Invalid Date */}
                      {ticket.concert_date
                        ? new Date(ticket.concert_date).toLocaleDateString(
                            "vi-VN",
                          )
                        : "02/03/2026"}
                    </p>
                    <p className="flex items-center gap-2">
                      <HiOutlineTicket className="text-[#8D1B1B]" /> Seat:{" "}
                      <span className="text-white font-bold">
                        {/* Trong DB thường là seat_label hoặc seat_number */}
                        {ticket.seat_label || ticket.seat_number || "A1"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Phần phải: QR Code / Price */}
                <div className="w-full md:w-48 bg-[#1A1A1A] p-6 flex flex-col items-center justify-center border-l border-black">
                  {/* <div className="w-24 h-24 bg-white p-2 rounded-lg mb-4"> */}
                  {/* Demo QR Code - Dinh có thể dùng thư viện qrcode.react */}
                  {/* <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.order_id}`}
                      alt="QR"
                      className="w-full h-full"
                    /> */}
                  {/* </div> */}
                  <p className="text-[#8D1B1B] font-black text-sm">
                    {ticket.price
                      ? `${ticket.price.toLocaleString()} đ`
                      : "0 đ"}
                  </p>
                  <button className="mt-4 text-[10px] text-gray-500 font-bold hover:text-white underline">
                    {/* View Details */}
                  </button>
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
          © 2026 TICKETX. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default MyTicket;
