import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineChevronDown,
  HiZoomIn,
  HiZoomOut,
  HiRefresh
} from "react-icons/hi";
import { AiFillHome } from "react-icons/ai";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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
  const [allSeatsData, setAllSeatsData] = useState({}); // Lưu danh sách ghế
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

        if (zonesRes.data?.success) {
          // Vì cấu trúc JSON mới của bạn: data là một Mảng
          // zonesRes.data.data chính là mảng [ {zone_id: ...}, {zone_id: ...} ]
          const apiZoneList = zonesRes.data.data;
          const allZones = Array.isArray(apiZoneList) ? apiZoneList : [];
          setZones(allZones);

          // Lấy dữ liệu ghế cho những khu vực có sơ đồ ghế
          const seatsMap = {};
          await Promise.all(
            allZones.map(async (zone) => {
              if (zone.has_seat_map) {
                const res = await axios.post(
                  `${import.meta.env.VITE_API_URL}/seat`,
                  { concert_id: id, zone_id: zone.zone_id },
                  { withCredentials: true }
                );
                if (res.data?.success) {
                  seatsMap[zone.zone_id] = res.data.data;
                }
              }
            })
          );
          setAllSeatsData(seatsMap);
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
          {/* Đổ bóng cyan phát sáng */}
          <div
            className="absolute inset-0 bg-[#00E5FF]/40 blur-[80px] pointer-events-none"
            style={{
              zIndex: 0,
              width: "105%",
              height: "90%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "40px"
            }}
          ></div>
          {/* KHỐI VÉ CHÍNH */}
          <div
            className="ticket-container ticket-notch-vertical relative"
            style={{ zIndex: 10 }}
          >
            <div className="flex flex-col md:flex-row relative bg-black">
              {/* LEFT SIDE */}
              <div className="flex-[0.7] p-8 md:p-12 flex flex-col justify-center gap-12 relative bg-black">
                <div>
                  <h2 className="text-6xl font-bebas text-white tracking-widest leading-none mb-8">
                    {concert.title}
                  </h2>

                  <div className="space-y-5">
                    <div className="flex items-center gap-4 text-gray-400">
                      <HiOutlineLocationMarker
                        size={28}
                        className="text-white border border-gray-700 p-1.5 rounded-xl"
                      />
                      <span className="text-[14px] font-bold uppercase tracking-wider text-gray-300">
                        {concert.venue_name || "Địa điểm đang cập nhật"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-gray-400">
                      <HiOutlineCalendar
                        size={28}
                        className="text-white border border-gray-700 p-1.5 rounded-xl"
                      />
                      <span className="text-[14px] font-bold uppercase tracking-wider text-gray-300">
                        {formatDate(concert.concert_date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="inline-block p-[2px] rounded-sm bg-gradient-to-r from-[#FF2D95] to-[#00E5FF] w-max">
                  <button
                    onClick={() =>
                      document
                        .getElementById("ticket-info")
                        .scrollIntoView({ behavior: "smooth" })
                    }
                    className="bg-black text-white font-black px-10 py-3 rounded-sm text-[13px] uppercase tracking-[0.2em] hover:bg-[#111] transition-all"
                  >
                    BUY NOW
                  </button>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex-1 p-8 flex flex-col justify-between bg-black">
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
                  <div className="flex items-center gap-3">
                    {/* Icon đô la */}
                    <div className="flex items-center justify-center border-[1.5px] border-[#FF2D95] rounded-md px-1.5 py-0.5">
                      <span className="text-[8px] text-[#FF2D95] mr-1">•</span>
                      <span className="text-[12px] font-bold text-[#FF2D95]">
                        $
                      </span>
                      <span className="text-[8px] text-[#FF2D95] ml-1">•</span>
                    </div>

                    {/* Số tiền với font Bebas Neue */}
                    <span className="text-4xl font-bebas text-white tracking-tighter">
                      {minPrice > 0
                        ? `${minPrice.toLocaleString()} đ`
                        : "Đang cập nhật"}
                    </span>

                    {/* Mũi tên chỉ hướng */}
                    <span className="text-white text-2xl font-bold ml-1">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CONCERT INTRODUCTION (NEW) */}
        <div className="relative mt-20 mb-20 px-2 group">
          {/* Pink Glow Behind */}
          <div
            className="absolute inset-0 bg-[#FF2D95]/30 blur-[80px] pointer-events-none"
            style={{
              zIndex: 0,
              width: "100%",
              height: "100%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "40px",
            }}
          ></div>

            <div
              className="relative bg-[#1A1A1A] rounded-[40px] overflow-hidden border border-[#FF2D95]/20 shadow-2xl"
              style={{ zIndex: 10 }}
            >
              {/* Header */}
              <div className="bg-black px-10 py-6 border-b border-gray-800">
                <h2 className="text-white text-4xl font-bebas tracking-widest">
                  Concert Introduction
                </h2>
              </div>

              {/* Sub Info */}
              <div className="px-10 py-8">
                <h3 className="text-white text-2xl font-black uppercase mb-1">
                  {concert.title}
                </h3>
                <p className="text-white text-lg font-bold mb-10">
                  Ngày {formatDate(concert.concert_date)} tại {concert.venue_name || "Địa điểm đang cập nhật"}
                </p>

                {/* Layout Image or Map */}
                {(() => {
                  let config = null;
                  if (concert.layout_config) {
                    try {
                      config = typeof concert.layout_config === 'string' ? JSON.parse(concert.layout_config) : concert.layout_config;
                      if (typeof config === 'string') config = JSON.parse(config);
                    } catch(e) {}
                  }

                  if (!config || !config.canvasConfig) {
                    return (
                      <div className="w-full rounded-2xl overflow-hidden border border-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        <img
                          src={concert.layout || "https://images.unsplash.com/photo-1540039155732-d68f2c5f111e?q=80&w=1000"}
                          alt="Concert Layout"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    );
                  }

                  return (
                    <div className="w-full h-[500px] relative rounded-2xl overflow-hidden border border-gray-800 bg-[#111] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
                      <TransformWrapper minScale={0.1} initialScale={0.7} centerOnInit>
                        {({ zoomIn, zoomOut, resetTransform }) => (
                          <>
                            {/* Controls Overlay */}
                            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                              <button onClick={() => zoomIn()} className="p-2 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 text-white shadow-lg"><HiZoomIn size={18} /></button>
                              <button onClick={() => zoomOut()} className="p-2 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 text-white shadow-lg"><HiZoomOut size={18} /></button>
                              <button onClick={() => resetTransform()} className="p-2 bg-[#FF2D95]/80 hover:bg-[#FF2D95] rounded-full shadow-lg text-white"><HiRefresh size={18} /></button>
                            </div>
                            
                            <TransformComponent wrapperClass="!w-full !h-full cursor-grab active:cursor-grabbing">
                              <div
                                className="relative bg-[#0a0a0a] border border-gray-900 rounded-lg"
                                style={{
                                  width: config.canvasConfig.width || 1200,
                                  height: config.canvasConfig.height || 800,
                                }}
                              >
                                {/* Sân khấu */}
                                {config.stages?.map((stage, idx) => (
                                  <div
                                    key={`stage-${idx}`}
                                    className="absolute bg-gray-700 flex items-center justify-center border-b-8 border-gray-600 shadow-xl overflow-hidden"
                                    style={{
                                      left: stage.layoutConfig.x,
                                      top: stage.layoutConfig.y,
                                      width: stage.layoutConfig.w,
                                      height: stage.layoutConfig.h,
                                      borderRadius: stage.shape === "circle" ? "50%" : "8px",
                                    }}
                                  >
                                    <span className="text-xl font-black text-gray-400 uppercase tracking-[0.2em] text-center break-words px-1">
                                      {stage.name || "SÂN KHẤU"}
                                    </span>
                                  </div>
                                ))}

                                {/* Khu vực */}
                                {config.zoneLayouts?.map((zl, idx) => {
                                  const matchedZone = zones.find((z) => z.zone_name === zl.zoneName);
                                  const colors = ["#bb69db", "#380c0c", "#F5DEB3", "#33cf33", "#00F0FF"];
                                  const color = colors[idx % colors.length];
                                  const zoneSeats = matchedZone ? allSeatsData[matchedZone.zone_id] : null;

                                  return (
                                    <div
                                      key={`zl-${idx}`}
                                      className="absolute flex flex-col items-center justify-center border-4 rounded-2xl shadow-xl transition-all p-2"
                                      style={{
                                        left: zl.layoutConfig.x,
                                        top: zl.layoutConfig.y,
                                        width: zl.layoutConfig.w,
                                        height: zl.layoutConfig.h,
                                        borderColor: color,
                                        backgroundColor: `${color}40`,
                                      }}
                                    >
                                      <div className="flex flex-col items-center mb-1 shrink-0 z-10 pointer-events-none">
                                        <span className="font-black text-xs uppercase text-white drop-shadow-md text-center px-1">
                                          {zl.zoneName}
                                        </span>
                                        {matchedZone && (
                                          <span className="text-[10px] font-black text-[#FFD700] bg-black/60 px-2 rounded-full whitespace-nowrap mt-0.5">
                                            {matchedZone.price.toLocaleString()} đ
                                          </span>
                                        )}
                                      </div>

                                      {matchedZone?.has_seat_map && zoneSeats ? (
                                        <div className="w-full overflow-y-auto flex-1 flex flex-col gap-2 custom-scroll">
                                          {Object.entries(zoneSeats).map(([tier, seats]) => (
                                            <div key={tier} className="flex flex-col items-center">
                                              <span className="text-[6px] text-gray-400 font-bold mb-1 uppercase">
                                                {tier}
                                              </span>
                                              {(() => {
                                                const groupedSeats = seats.reduce((acc, seat) => {
                                                  const match = seat.seat_label.match(/^[A-Za-z]+/);
                                                  const row = match ? match[0] : 'Other';
                                                  if (!acc[row]) acc[row] = [];
                                                  acc[row].push(seat);
                                                  return acc;
                                                }, {});
                                                
                                                return (
                                                  <div className="flex flex-col gap-1 w-full overflow-x-auto custom-scroll pb-2">
                                                    {Object.entries(groupedSeats).map(([row, rowSeats]) => (
                                                      <div key={row} className="flex gap-1 w-max min-w-full before:flex-1 after:flex-1 px-2">
                                                        {rowSeats.map((seat) => {
                                                          const isOccupied = seat.status !== "AVAILABLE";
                                                          return (
                                                            <div
                                                              key={seat.seat_id}
                                                              className={`w-5 h-5 rounded-[4px] flex items-center justify-center text-[7px] font-black
                                                              ${
                                                                isOccupied
                                                                  ? "bg-gray-600/40 text-white/20"
                                                                  : "bg-white/90 text-black border border-white/50 shadow-sm"
                                                              }`}
                                                            >
                                                              {seat.seat_label}
                                                            </div>
                                                          );
                                                        })}
                                                      </div>
                                                    ))}
                                                  </div>
                                                );
                                              })()}
                                            </div>
                                          ))}
                                        </div>
                                      ) : matchedZone && !matchedZone.has_seat_map ? (
                                        <div className="absolute inset-1 flex items-center justify-center border-2 border-dashed border-white/20 rounded-xl pointer-events-none overflow-visible">
                                          <span className="text-[8px] text-gray-400/80 font-black italic uppercase bg-black/40 px-1 rounded backdrop-blur-sm whitespace-nowrap">
                                            KHU VỰC ĐỨNG
                                          </span>
                                        </div>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            </TransformComponent>
                          </>
                        )}
                      </TransformWrapper>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

        {/* SECTION 3: TICKET INFORMATION (ZONE LIST) */}
        <div className="relative mt-20 mb-20 px-2 group">
          {/* Pink Glow Behind Container */}
          <div
            className="absolute inset-0 bg-[#FF2D95]/20 blur-[100px] pointer-events-none"
            style={{
              zIndex: 0,
              width: "100%",
              height: "100%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "40px",
            }}
          ></div>

          <div
            id="ticket-info"
            className="relative bg-[#0A0A0A] rounded-[30px] p-10 shadow-[0_0_40px_rgba(255,45,149,0.15)] border border-[#FF2D95]/20"
            style={{ zIndex: 10 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-white text-4xl font-bebas tracking-widest">
                Ticket information
              </h2>
              {/* Menu Icon Placeholder */}
              {/* <div className="w-10 h-6 border border-gray-500 rounded-md flex items-center justify-center gap-1 cursor-pointer hover:border-gray-300">
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              </div> */}
            </div>

            <div className="space-y-6">
              {zones.length === 0 ? (
                <div className="text-gray-500 text-center py-10 italic font-bold">
                  Thông tin vé đang được cập nhật...
                </div>
              ) : (
                zones.map((zone) => (
                  <div
                    key={zone.zone_id}
                    className="bg-[#1C1C1E] rounded-md px-8 py-6 flex items-center justify-between shadow-[0_0_20px_rgba(255,45,149,0.3)] border border-[#FF2D95]/10 hover:border-[#FF2D95]/50 transition-all"
                  >
                    <div className="flex-1 flex items-center gap-4">
                      <span className="text-white font-bold text-lg uppercase">
                        {zone.zone_name}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-black px-2 py-1 rounded-sm border ${
                          zone.has_seat_map
                            ? "text-blue-400 border-blue-400/30 bg-blue-400/10"
                            : "text-[#33cf33] border-[#33cf33]/30 bg-[#33cf33]/10"
                        }`}
                      >
                        {zone.has_seat_map ? "Khu vực Ngồi" : "Khu vực Đứng"}
                      </span>
                    </div>

                    <div className="flex-1 flex justify-center">
                      <span className="text-white font-black text-[17px] relative">
                        {zone.price.toLocaleString()} đ
                        {/* Fake Brush Underline */}
                        <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-[#D31313] rounded-full rotate-[-1deg] blur-[0.5px]"></span>
                      </span>
                    </div>

                    <div className="flex-1 flex justify-end">
                      <button
                        onClick={() => navigate(`/concert/${id}/selection`)}
                        className="bg-[#FF2D95] text-white font-black px-12 py-3 rounded text-sm hover:bg-[#ff1683] hover:shadow-[0_0_15px_#FF2D95] transition-all"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConcertDetail;
