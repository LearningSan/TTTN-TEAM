import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  HiOutlineChevronLeft,
  HiZoomIn,
  HiZoomOut,
  HiRefresh,
  HiMinus,
  HiPlus,
} from "react-icons/hi";

const Selection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [concert, setConcert] = useState(null);
  const [zones, setZones] = useState([]);

  const [allSeatsData, setAllSeatsData] = useState({});

  const [activeZone, setActiveZone] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [standingQty, setStandingQty] = useState({});

  const zoneColors = ["#bb69db", "#380c0c", "#F5DEB3", "#33cf33", "#00F0FF"];
  const [layoutConfig, setLayoutConfig] = useState(null);
  useEffect(() => {
    const initData = async () => {
      if (!id || id === "undefined") return;
      try {
        setLoading(true);
        // 1. Lấy thông tin Concert
        const concertRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/concert/${id}`,
          { concert_id: id },
        );
        const concertData = concertRes.data?.data || concertRes.data;
        setConcert(concertData);

        const rawConfig = concertData?.concert?.layout_config || concertData?.layout_config;
        console.log("🔥 concertData received:", concertData);
        console.log("🔥 rawConfig received:", rawConfig);
        if (rawConfig) {
          try {
            let parsed = typeof rawConfig === "string" ? JSON.parse(rawConfig) : rawConfig;
            if (typeof parsed === "string") parsed = JSON.parse(parsed);
            console.log("🔥 parsed layoutConfig:", parsed);
            setLayoutConfig(parsed);
          } catch (error) {
            console.error("Lỗi parse layout_config:", error);
          }
        } else {
          console.log("🔥 NO rawConfig FOUND in concertData");
        }

        // 2. Lấy danh sách Zone
        const zonesRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/zone`,
          { concert_id: id },
        );
        const allZones = zonesRes.data?.data || [];
        setZones(allZones);

        // 3. Fetch TRƯỚC toàn bộ ghế cho các khu có sơ đồ
        const seatsMap = {};
        await Promise.all(
          allZones.map(async (zone) => {
            if (zone.has_seat_map) {
              const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/seat`,
                {
                  concert_id: id,
                  zone_id: zone.zone_id,
                },
              );
              if (res.data?.success) {
                seatsMap[zone.zone_id] = res.data.data;
              }
            }
          }),
        );
        setAllSeatsData(seatsMap);

        if (allZones.length > 0) setActiveZone(allZones[0].zone_id);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id]);

  // Khôi phục ghế đã chọn sau khi đăng nhập quay lại
  useEffect(() => {
    const savedSeats = sessionStorage.getItem("pendingSeats");
    const savedStanding = sessionStorage.getItem("pendingStanding");
    if (savedSeats) {
      try {
        setSelectedSeats(JSON.parse(savedSeats));
        sessionStorage.removeItem("pendingSeats");
      } catch (e) { console.error(e); }
    }
    if (savedStanding) {
      try {
        setStandingQty(JSON.parse(savedStanding));
        sessionStorage.removeItem("pendingStanding");
      } catch (e) { console.error(e); }
    }
  }, []);

  const handleSeatClick = (seat, zone) => {
    if (seat.status !== "AVAILABLE") return;
    setSelectedSeats((prev) => {
      if (prev.find((s) => s.seat_id === seat.seat_id)) {
        return prev.filter((s) => s.seat_id !== seat.seat_id);
      }
      return [
        ...prev,
        { ...seat, zone_id: zone.zone_id, zone_name: zone.zone_name },
      ];
    });
  };

  const handleUpdateStandingQty = (zoneId, delta, available) => {
    setStandingQty((prev) => {
      const current = prev[zoneId] || 0;
      const newVal = Math.max(0, Math.min(current + delta, available));
      return { ...prev, [zoneId]: newVal };
    });
  };

  const calculateTotal = () => {
    const seatTotal = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
    const standingTotal = zones.reduce((sum, z) => {
      if (!z.has_seat_map) {
        return sum + (standingQty[z.zone_id] || 0) * z.price;
      }
      return sum;
    }, 0);
    return seatTotal + standingTotal;
  };

  const getZoneStyle = (index) => ({
    left: `${(index % 3) * 350 + 50}px`,
    top: `${Math.floor(index / 3) * 300 + 150}px`,
    width: "320px",
    minHeight: "220px",
  });

  if (loading)
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center font-black">
        ĐANG TẢI...
      </div>
    );

  return (
    <div className="flex h-screen bg-[#111827] text-white overflow-hidden font-sans relative">
      {/* CỘT TRÁI: SƠ ĐỒ CHỌN CHỖ */}
      <div className="flex-1 min-w-0 relative flex flex-col border-r border-[#FF2D95]/20 bg-[#0A0A0A] overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[#00E5FF]/10 blur-[120px] pointer-events-none" />

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black to-transparent">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:text-[#FF2D95] font-black uppercase text-xs transition-colors"
          >
            <HiOutlineChevronLeft size={24} /> Trở về
          </button>
          <div className="text-center">
            <h2 className="text-white text-xl font-black uppercase tracking-tighter">
              Sơ đồ sân khấu {layoutConfig ? "✅" : "❌"}
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Chọn ghế trực tiếp trên sơ đồ
            </p>
          </div>
          <div className="w-20" />
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          <TransformWrapper minScale={0.1} initialScale={0.5} centerOnInit>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute top-50 left-10 z-20 flex flex-col gap-3">
                  <button
                    onClick={() => zoomIn()}
                    className="p-3 bg-white/10 rounded-full border border-white/20 hover:bg-white/20"
                  >
                    <HiZoomIn size={20} />
                  </button>
                  <button
                    onClick={() => zoomOut()}
                    className="p-3 bg-white/10 rounded-full border border-white/20 hover:bg-white/20"
                  >
                    <HiZoomOut size={20} />
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    className="p-3 bg-[#FF2D95]/80 hover:bg-[#FF2D95] rounded-full shadow-[0_0_15px_rgba(255,45,149,0.5)] transition-all"
                  >
                    <HiRefresh size={20} />
                  </button>
                </div>

                <TransformComponent wrapperClass="!w-full !h-full">
                  <div
                    className="relative bg-[#111] border border-gray-900 shadow-2xl rounded-lg"
                    style={{ 
                      width: layoutConfig?.canvasConfig?.width || 1200, 
                      height: layoutConfig?.canvasConfig?.height || 800 
                    }}
                  >
                    {layoutConfig?.stages && layoutConfig.stages.length > 0 ? (
                      layoutConfig.stages.map((stage, idx) => (
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
                      ))
                    ) : (
                      <div
                        className="absolute bg-gray-700 flex items-center justify-center border-b-8 border-gray-600 rounded-b-xl shadow-xl"
                        style={{ left: 400, top: 20, width: 400, height: 80 }}
                      >
                        <span className="text-xl font-black text-gray-400 uppercase tracking-[0.5em]">
                          SÂN KHẤU
                        </span>
                      </div>
                    )}

                    {zones.map((zone, index) => {
                      const isActive = activeZone === zone.zone_id;
                      let style = getZoneStyle(index);
                      
                      if (layoutConfig?.zoneLayouts) {
                        const customLayout = layoutConfig.zoneLayouts.find(
                          (zl) => zl.zoneName === zone.zone_name
                        );
                        if (customLayout) {
                          style = {
                            left: `${customLayout.layoutConfig.x}px`,
                            top: `${customLayout.layoutConfig.y}px`,
                            width: `${customLayout.layoutConfig.w}px`,
                            height: `${customLayout.layoutConfig.h}px`,
                          };
                        }
                      }

                      const zoneSeats = allSeatsData[zone.zone_id];

                      const colors = ["#FF2D95", "#00E5FF", "#bb69db", "#33cf33", "#F5DEB3"];
                      const color = colors[index % colors.length];

                      return (
                        <div
                          key={zone.zone_id}
                          onClick={() => setActiveZone(zone.zone_id)}
                          className={`absolute flex flex-col items-center border-4 rounded-2xl p-4 transition-all cursor-pointer`}
                          style={{
                            ...style,
                            borderColor: isActive ? color : '#333',
                            backgroundColor: isActive ? `${color}30` : 'rgba(0,0,0,0.6)',
                            boxShadow: isActive ? `0 0 25px ${color}80` : 'none'
                          }}
                        >
                          <div className="mb-3 text-center z-10 shrink-0">
                            <span className="font-black text-xs uppercase block text-white drop-shadow-md">
                              {zone.zone_name}
                            </span>
                            <span className="text-[10px] font-black text-[#FFD700] bg-black/60 px-2 rounded-full whitespace-nowrap mt-0.5 inline-block">
                              {zone.price.toLocaleString()} đ
                            </span>
                          </div>

                          {/* PHẦN HIỂN THỊ GHẾ TRỰC TIẾP */}
                          {zone.has_seat_map && zoneSeats ? (
                            <div className="w-full overflow-y-auto max-h-[150px] flex flex-col gap-4 p-2 custom-scroll">
                              {Object.entries(zoneSeats).map(
                                ([tier, seats]) => (
                                  <div
                                    key={tier}
                                    className="flex flex-col items-center"
                                  >
                                    <span className="text-[7px] text-gray-500 font-bold mb-1">
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
                                                const isSelected = selectedSeats.some(
                                                  (s) => s.seat_id === seat.seat_id,
                                                );
                                                const isOccupied =
                                                  seat.status !== "AVAILABLE";
                                                return (
                                                  <button
                                                    key={seat.seat_id}
                                                    disabled={isOccupied}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setActiveZone(zone.zone_id);
                                                      handleSeatClick(seat, zone);
                                                    }}
                                                    className={`w-6 h-6 rounded-md text-[8px] font-black transition-all shadow-sm
                                                    ${
                                                      isOccupied
                                                        ? "bg-gray-600/40 text-white/20 cursor-not-allowed"
                                                        : isSelected
                                                          ? "bg-[#00E5FF] text-black border border-white shadow-[0_0_10px_#00E5FF] scale-110"
                                                          : "bg-white text-black hover:bg-gray-300"
                                                    }`}
                                                  >
                                                    {seat.seat_label}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <div className="absolute inset-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl pointer-events-none">
                              <span className="text-[10px] text-gray-500/80 font-black italic bg-black/40 px-1 rounded backdrop-blur-sm whitespace-nowrap mt-4">
                                KHU VỰC ĐỨNG
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      </div>

      {/* CỘT PHẢI: GIỎ HÀNG & THANH TOÁN */}
      <div className="w-[420px] 2xl:w-[500px] bg-[#0A0A0A] flex flex-col border-l border-[#FF2D95]/20 shrink-0 relative z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
        {/* 1. Header: Thông tin sự kiện */}
        <div className="p-8 border-b border-[#00E5FF]/20 bg-gradient-to-b from-[#111827] to-[#0A0A0A]">
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-2 leading-tight text-white">
            {concert?.concert?.title || concert?.title || "Tên sự kiện"}
          </h1>
          <div className="flex items-center gap-2 text-gray-400 font-bold text-xs">
            <span className="px-2 py-0.5 bg-[#FF2D95]/20 rounded border border-[#FF2D95]/50 text-[#FF2D95] shadow-[0_0_10px_rgba(255,45,149,0.3)]">
              LIVE
            </span>
            <p className="truncate">
              📍 {concert?.venue?.name || "Địa điểm chưa xác định"}
            </p>
          </div>
        </div>

        {/* 2. Danh sách vé đã chọn */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scroll">
          <div className="flex justify-between items-center mb-2 px-2">
            <span className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">
              Vé đã chọn
            </span>
            <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
              {selectedSeats.length +
                Object.values(standingQty).reduce((a, b) => a + b, 0)}{" "}
              vé
            </span>
          </div>

          {/* Render Vé Ghế Ngồi */}
          {selectedSeats.map((seat, index) => (
            <div
              key={seat.seat_id}
              className="group relative bg-[#161616] border border-gray-800 p-4 rounded-xl transition-all hover:border-[#33cf33]/50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#bb69db]"></div>
                    <p className="font-black text-[11px] uppercase tracking-wider text-gray-200">
                      Khu: {seat.zone_name}
                    </p>
                  </div>
                  <p className="text-lg font-black text-white">
                    Ghế {seat.seat_label}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">
                    {seat.tier_name || "Standard"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#00E5FF] font-black text-sm drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]">
                    {seat.price.toLocaleString()} <span className="text-[10px] text-gray-400">đ</span>
                  </p>
                  <button
                    onClick={() =>
                      handleSeatClick(seat, { zone_id: seat.zone_id })
                    }
                    className="mt-2 text-[9px] font-black text-[#FF2D95] uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              {/* Decor lỗ vé (Ticket notch) */}
              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#0F0F0F] rounded-full border-r border-gray-800"></div>
            </div>
          ))}

          {/* Render Vé Đứng (Số lượng) */}
          {zones
            .filter(
              (z) =>
                !z.has_seat_map &&
                (standingQty[z.zone_id] > 0 || activeZone === z.zone_id),
            )
            .map((zone, index) => {
              const qty = standingQty[zone.zone_id] || 0;
              return (
                <div
                  key={zone.zone_id}
                  className={`p-4 rounded-xl border-2 transition-all ${activeZone === zone.zone_id ? "border-[#33cf33] bg-[#1A1A1A]" : "border-gray-900 bg-[#161616]"}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-black text-[11px] uppercase text-gray-400">
                        Khu đứng: {zone.zone_name}
                      </p>
                      <p className="text-sm font-black text-[#00E5FF] drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]">
                        {zone.price.toLocaleString()} đ <span className="text-gray-600 text-[10px]">/ vé</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-black rounded-lg p-1.5 border border-gray-800">
                      <button
                        onClick={() =>
                          handleUpdateStandingQty(
                            zone.zone_id,
                            -1,
                            zone.available_seats,
                          )
                        }
                        className="w-7 h-7 flex items-center justify-center bg-gray-900 hover:bg-gray-800 rounded-md text-xs transition-colors"
                      >
                        <HiMinus />
                      </button>
                      <span className="text-sm font-black w-4 text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateStandingQty(
                            zone.zone_id,
                            1,
                            zone.available_seats,
                          )
                        }
                        className="w-7 h-7 flex items-center justify-center bg-[#00E5FF]/80 hover:bg-[#00E5FF] rounded-md text-xs text-black transition-colors"
                      >
                        <HiPlus />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

          {selectedSeats.length === 0 &&
            Object.values(standingQty).every((q) => q === 0) && (
              <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-900 rounded-2xl">
                <p className="text-gray-700 font-black text-[10px] uppercase">
                  Chưa có vé nào
                </p>
              </div>
            )}
        </div>

        {/* 3. Footer: Tổng cộng & Thanh toán */}
        <div className="p-8 bg-black border-t border-gray-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                Tổng số tiền
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {calculateTotal().toLocaleString()}
                </span>
                <span className="text-sm font-black text-[#00E5FF]">đ</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-600 uppercase italic">
                Đã bao gồm VAT
              </p>
            </div>
          </div>

          <button
            disabled={calculateTotal() === 0}
            onClick={() => {
              const user = localStorage.getItem("user");
              if (!user) {
                alert("Vui lòng đăng nhập để tiếp tục thanh toán!");
                // Lưu lại ghế đã chọn để sau khi login quay lại vẫn còn
                sessionStorage.setItem("pendingSeats", JSON.stringify(selectedSeats));
                sessionStorage.setItem("pendingStanding", JSON.stringify(standingQty));
                navigate("/login", { state: { from: window.location.pathname } });
                return;
              }
              navigate(`/concert/${id}/checkout`, {
                state: {
                  selectedSeats,
                  standingTickets: standingQty,
                  zones: zones,
                  concert: concert?.concert
                    ? { ...concert.concert, venue_name: concert.venue?.name }
                    : concert,
                  total: calculateTotal(),
                },
              });
            }}
            className={`group relative w-full py-5 rounded-xl font-black uppercase text-sm tracking-widest transition-all overflow-hidden
              ${
                calculateTotal() > 0
                  ? "bg-gradient-to-r from-[#FF2D95] to-[#00E5FF] text-white shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(255,45,149,0.6)] active:scale-[0.98]"
                  : "bg-gray-900 text-gray-700 cursor-not-allowed"
              }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Tiếp tục thanh toán
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </span>
          </button>
        </div>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </div>
  );
};

export default Selection;
