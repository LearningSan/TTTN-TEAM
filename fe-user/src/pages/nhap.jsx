import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineChevronDown,
} from "react-icons/hi";
import { AiFillHome } from "react-icons/ai";

const ConcertDetail = () => {
  const { id } = useParams(); // Lấy ID concert từ URL
  const navigate = useNavigate();
  const location = useLocation();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcertDetail = async () => {
      try {
        // Gọi API lấy chi tiết theo ID
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/concert/${id}`,
        );
        if (response.data?.success) {
          setConcert(response.data.data[0]); // Lấy phần tử đầu tiên của mảng data
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết concert:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConcertDetail();
  }, [id]);

  // Hàm hỗ trợ format ngày an toàn
  const formatDate = (dateStr) => {
    if (!dateStr) return "Sắp diễn ra";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch (err) {
      return dateStr;
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold">
        Loading...
      </div>
    );
  if (!concert)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold">
        Concert không tồn tại!
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-[#8D1B1B] py-3 text-white">
        <div className="max-w-7xl mx-auto flex justify-center gap-10 text-[13px] font-black uppercase tracking-tight">
          <a href="#">Theatre & Arts</a>
          <a href="#">Sports</a>
          <a href="#">Seminars & Workshops</a>
          <a href="#">Resale Ticket</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-10 px-4">
        {/* SECTION 1: TICKET PASS */}
        <div className="relative group">
          {/* Đổ bóng đỏ phát sáng */}
          <div className="absolute inset-0 bg-[#8D1B1B]/20 blur-[100px] rounded-full -z-10"></div>

          <div className="ticket-container ticket-notch-vertical shadow-2xl border border-gray-900">
            <div className="flex flex-col md:flex-row relative">
              {/* LEFT SIDE */}
              <div className="flex-[0.7] p-8 md:p-10 flex flex-col justify-between border-r-2 border-dashed border-gray-700/50 relative">
                <div className="absolute right-[-2px] top-0 bottom-0 border-r-2 border-dashed border-gray-600"></div>

                <div>
                  <h2 className="text-6xl font-bebas text-white tracking-widest leading-none mb-10">
                    {concert.title || "NAME SHOW"}
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-gray-400">
                      <HiOutlineLocationMarker
                        size={32}
                        className="text-white border border-gray-700 p-1.5 rounded-xl"
                      />
                      <span className="text-[14px] font-bold uppercase tracking-wider text-gray-300">
                        {concert.venue_name || "Địa điểm đang cập nhật"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-gray-400">
                      <HiOutlineCalendar
                        size={32}
                        className="text-white border border-gray-700 p-1.5 rounded-xl"
                      />
                      <span className="text-[14px] font-bold uppercase tracking-wider text-gray-300">
                        {formatDate(concert.concert_date)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(`/concert/${id}/zone/${concert.zone_id}`)
                  }
                  className="w-fit bg-[#222] text-white font-black px-12 py-3 rounded-md text-[13px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all border border-gray-700 mt-12"
                >
                  Buy Now
                </button>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex-1 p-8 flex flex-col justify-between bg-[#0a0a0a]">
                <div className="w-full h-[280px] rounded-[40px] overflow-hidden border border-gray-800 shadow-2xl">
                  <img
                    src={
                      concert.banner_url ||
                      "https://via.placeholder.com/500x300"
                    }
                    className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                    alt="banner"
                  />
                </div>

                <div className="flex items-center justify-end mt-6">
                  <div className="flex items-center gap-3 px-6 py-2 bg-[#111] border border-gray-800 rounded-full">
                    <span className="text-[12px] font-bold text-gray-500">
                      $
                    </span>
                    <span className="text-4xl font-bebas text-white tracking-tighter">
                      {concert.price?.toLocaleString() || "0"} đ
                    </span>
                    <span className="text-white text-xl ml-2">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: TICKET INFORMATION (ZONE LIST) */}
        <div className="mt-12 bg-black rounded-3xl p-8 shadow-xl mb-20">
          <h3 className="text-white font-black uppercase mb-6 border-b border-gray-800 pb-2">
            Ticket Information
          </h3>

          <div className="space-y-4">
            {/* Giả sử bạn map danh sách các Zone từ API */}
            <div className="bg-[#EAEAEA] rounded-xl p-4 flex items-center justify-between shadow-lg">
              <div className="flex flex-col">
                <span className="text-black font-black text-lg">
                  Ticket: {concert.zone_name}
                </span>
                <span className="text-gray-600 text-xs font-bold">
                  Available: {concert.available_seats} seats
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-black font-black underline decoration-[#8D1B1B] decoration-2 underline-offset-4">
                  {concert.price?.toLocaleString()} đ
                </span>

                {/* NÚT MUA: Khi bấm sẽ nhảy sang trang chọn ghế với đúng Concert ID và Zone ID */}
                <button
                  onClick={() =>
                    navigate(`/concert/${id}/zone/${concert.zone_id}`)
                  }
                  className="bg-[#8D1B1B] text-white px-6 py-2 rounded-lg font-black text-xs hover:bg-black transition-all"
                >
                  Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#F5F5F5] py-10 text-center border-t border-gray-200">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          © 2026 TICKETX. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default ConcertDetail;
