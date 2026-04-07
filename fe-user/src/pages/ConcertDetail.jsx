import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
      {/* Header đồng bộ các trang khác */}
      <header className="bg-white py-4 px-12 flex items-center justify-between border-b border-gray-100">
        <Link
          to="/"
          className="text-3xl font-black tracking-tighter text-[#8D1B1B]"
        >
          TICKETX
        </Link>
        <div className="flex items-center gap-10 text-sm font-medium text-gray-700">
          <Link to="/login" className="hover:text-[#8D1B1B]">
            Sign in
          </Link>
          <Link to="/">
            <AiFillHome size={22} />
          </Link>
        </div>
      </header>

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
        <div className="relative bg-black rounded-[30px] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-gray-800">
          {/* Left Side: Info */}
          <div className="flex-1 p-8 text-white border-r border-dashed border-gray-600 relative">
            {/* Rãnh cắt của vé */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-white rounded-full"></div>

            <h2 className="text-2xl font-black uppercase mb-4">
              {concert.title}
            </h2>
            <div className="space-y-3 text-sm text-gray-300">
              <p className="flex items-center gap-2">
                <HiOutlineLocationMarker className="text-[#8D1B1B]" />{" "}
                {concert.venue_name}
              </p>
              <p className="flex items-center gap-2">
                <HiOutlineCalendar className="text-[#8D1B1B]" />{" "}
                {new Date(concert.concert_date).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => navigate(`/concert/${id}/zone/${concert.zone_id}`)}
              className="mt-8 bg-white text-black font-black px-8 py-2 rounded-lg text-sm hover:bg-[#8D1B1B] hover:text-white transition-all uppercase"
            >
              Buy Now
            </button>
          </div>

          {/* Right Side: Image & Price */}
          <div className="w-full md:w-1/3 bg-gray-900 flex flex-col p-6 items-center justify-center text-white">
            <div className="w-full h-40 rounded-xl overflow-hidden mb-4">
              <img
                src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=500"
                alt="banner"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xl font-black">
              {concert.price?.toLocaleString()} đ ~
            </p>
          </div>
        </div>

        {/* SECTION 2: CONCERT INTRODUCTION */}
        <div className="mt-12 bg-black rounded-3xl p-8 shadow-xl">
          <h3 className="text-white font-black uppercase mb-6 border-b border-gray-800 pb-2">
            Concert Introduction
          </h3>
          <div className="text-gray-300 text-sm leading-relaxed mb-6">
            <p className="font-bold text-white mb-2">{concert.title}</p>
            <p>
              Địa điểm: {concert.venue_name} - {concert.address},{" "}
              {concert.district}, {concert.city}
            </p>
          </div>
          {/* Sơ đồ khu vực (Ảnh minh họa) */}
          <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-inner">
            <img
              src="https://st.ticketbox.vn/static/images/seat-map-default.png"
              alt="Sơ đồ sân vận động"
              className="w-full opacity-80"
            />
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
