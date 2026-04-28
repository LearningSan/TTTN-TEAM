import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineChevronDown,
} from "react-icons/hi";
import { AiFillHome } from "react-icons/ai";

const formatDate = (dateString) => {
  if (!dateString) return "Đang cập nhật";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
const ConcertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [zones, setZones] = useState([]); // Lưu danh sách zone
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("ID hiện tại:", id);

        // 1. Lấy chi tiết Concert

        const concertRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/concert/${id}`, // PHẢI có ${id} ở đây để tránh lỗi 405
          { concert_id: id }, // ĐỒNG THỜI gửi ID trong body để tránh lỗi 500
          { withCredentials: true },
        );
        console.log("Data Concert về nè:", concertRes.data); // Thêm dòng này
        // Tìm đoạn này trong useEffect của ConcertDetail.jsx
        if (concertRes.data?.success) {
          // Vì cấu trúc là res.data (của axios) -> .data (của API) -> .concert
          const apiData = concertRes.data.data;
          const concertInfo = apiData?.concert;
          const venueInfo = apiData?.venue;

          if (concertInfo) {
            setConcert({
              ...concertInfo,
              // Lấy tên sân vận động từ venue nằm trong data
              venue_name: venueInfo?.name || "Địa điểm đang cập nhật",
            });
          }
        }
        // 2. Lấy danh sách Zone theo concert_id
        // Tìm đến đoạn xử lý Zone trong ConcertDetail.jsx
        const zonesRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/zone`,
          { concert_id: id },
          { withCredentials: true },
        );

        // Tìm đoạn này trong ConcertDetail.jsx
        if (zonesRes.data?.success) {
          // Vì cấu trúc JSON mới của bạn: data là một Mảng
          // zonesRes.data.data chính là mảng [ {zone_id: ...}, {zone_id: ...} ]
          const apiZoneList = zonesRes.data.data;
          setZones(Array.isArray(apiZoneList) ? apiZoneList : []);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 3. Tự tính giá thấp nhất để hiển thị trên Banner
  const minPrice =
    zones.length > 0 ? Math.min(...zones.map((z) => z.price)) : 0;
  {
    /* Hiển thị thông báo nếu mảng zones trống */
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="w-12 h-12 border-4 border-t-red-600 border-gray-800 rounded-full animate-spin mb-4"></div>
        <p className="font-black uppercase tracking-widest text-sm">
          Loading Show Details...
        </p>
      </div>
    );
  }
  if (!concert) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h2 className="text-2xl font-black uppercase text-gray-800 mb-4">
          Concert không tồn tại!
        </h2>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-black text-white font-bold rounded-lg uppercase text-xs"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#111827] font-sans">
      <nav className="bg-[#0A0A0A] py-6 border-b border-gray-900 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-start gap-12 text-[18px] font-[900] uppercase tracking-tighter px-12 items-end">
          {[
            {
              name: "Theatre & Arts",
              color: "bg-[#FF2D95]",
              shadow: "shadow-[0_0_10px_#FF2D95]",
              path: "#",
            },
            {
              name: "Sports",
              color: "bg-[#00E5FF]",
              shadow: "shadow-[0_0_10px_#00E5FF]",
              path: "#",
            },
            {
              name: "Seminars & Workshops",
              color: "bg-[#FF2D95]",
              shadow: "shadow-[0_0_10px_#FF2D95]",
              path: "#",
            },
            // Mục Resale Ticket sẽ dùng Link đặc biệt
            {
              name: "Resale Ticket",
              color: "bg-[#00E5FF]",
              shadow: "shadow-[0_0_10px_#00E5FF]",
              path: "/resale-market",
              isLink: true,
            },
          ].map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center group cursor-pointer"
            >
              {item.isLink ? (
                <Link
                  to={item.path}
                  className="text-white hover:text-[#00E5FF] transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ) : (
                <a
                  href={item.path}
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  {item.name}
                </a>
              )}

              {/* Thanh line neon phía dưới giữ nguyên để đồng bộ giao diện */}
              <div
                className={`h-[3px] w-full mt-2 ${item.color} ${item.shadow} transition-transform duration-300 group-hover:scale-x-110`}
              ></div>
            </div>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-10 px-4">
        {/* SECTION 1: TICKET PASS */}
        <div className="relative group px-2">
          {/* Đổ bóng đỏ phát sáng */}
          <div
            className="absolute inset-0 bg-red-600/40 blur-[120px] rounded-full pointer-events-none"
            style={{
              zIndex: 0,
              width: "90%", // Thu hẹp chiều ngang bóng để tập trung ánh sáng
              height: "70%", // Thu hẹp chiều cao
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          ></div>
          {/* KHỐI VÉ CHÍNH */}
          <div
            className="ticket-container ticket-notch-vertical shadow-[0_0_50px_rgba(255,0,0,0.2)] relative"
            style={{ zIndex: 10 }}
          >
            <div className="flex flex-col md:flex-row relative bg-black">
              {/* LEFT SIDE */}
              <div className="flex-[0.7] p-8 md:p-12 flex flex-col justify-between border-r-2 border-dashed border-gray-700/50 relative bg-black">
                <div>
                  <h2 className="text-6xl font-bebas text-white tracking-widest leading-none mb-10">
                    {concert.title}
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
                    document
                      .getElementById("ticket-info")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                  className="mt-10 bg-[#222] text-white font-black px-10 py-3 rounded-md text-[13px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all border border-gray-700"
                >
                  View Tickets
                </button>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex-1 p-8 flex flex-col justify-between bg-[#0a0a0a]">
                <div className="w-full h-70 rounded-[40px] overflow-hidden border border-gray-800 shadow-2xl">
                  <img
                    src={
                      concert.banner_url ||
                      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000"
                    }
                    className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                    alt="banner"
                  />
                </div>

                <div className="flex items-center justify-center w-full mt-4">
                  <div className="flex items-center gap-3 px-6 py-2   shadow-inner">
                    {/* Icon đô la */}
                    <div className="flex items-center justify-center border-[1.5px] border-gray-500 rounded-sm px-1 py-0.5 min-w-6">
                      <span className="text-[6px] text-gray-500 mr-1">•</span>
                      <span className="text-[10px] font-bold text-gray-400">
                        $
                      </span>
                      <span className="text-[6px] text-gray-500 ml-1">•</span>
                    </div>

                    {/* Số tiền với font Bebas Neue */}
                    <span className="text-3xl font-bebas text-white tracking-tighter">
                      {minPrice > 0
                        ? `${minPrice.toLocaleString()} đ`
                        : "Đang cập nhật"}
                    </span>

                    {/* Mũi tên chỉ hướng
                    <span className="text-white text-xl font-light ml-1">
                      →
                    </span> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: TICKET INFORMATION (ZONE LIST) */}
        <div
          id="ticket-info"
          className="mt-12 bg-black rounded-3xl p-8 shadow-xl mb-20"
        >
          <h3 className="text-white font-black uppercase mb-6 border-b border-gray-800 pb-2">
            Available Zones
          </h3>

          {/* Thay thế đoạn từ dòng 209 đến 243 trong file của bạn bằng đoạn này */}
          <div className="space-y-4">
            {zones.length === 0 ? (
              // Hiển thị cái này nếu chưa có vé
              <div className="text-gray-500 text-center py-10 italic font-bold">
                Thông tin vé đang được cập nhật...
              </div>
            ) : (
              // Hiển thị danh sách nếu đã có vé
              zones.map((zone) => (
                <div
                  key={zone.zone_id}
                  className="bg-[#EAEAEA] rounded-xl p-4 flex items-center justify-between shadow-lg"
                >
                  <div className="flex flex-col">
                    <span className="text-black font-black text-lg uppercase">
                      {zone.zone_name}
                      <span className="ml-2 text-[10px] bg-gray-300 px-2 py-0.5 rounded uppercase">
                        {zone.has_seat_map ? "Seat-based" : "Standing"}
                      </span>
                    </span>
                    <span className="text-gray-600 text-xs font-bold">
                      Capacity: {zone.available_seats} / {zone.capacity}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-black font-black underline decoration-[#8D1B1B] decoration-2 underline-offset-4">
                      {zone.price.toLocaleString()} đ
                    </span>

                    <button
                      onClick={() => {
                        // Không phân biệt zoneId ở URL nữa, cứ vào trang tổng
                        navigate(`/concert/${id}/selection`);
                      }}
                      className="..."
                    >
                      Chọn
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="bg-[#F5F5F5] py-10 text-center border-t border-gray-200">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          © 2026 TICKETX.
        </p>
      </footer>
    </div>
  );
};

export default ConcertDetail;
