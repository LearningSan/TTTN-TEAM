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
  const [seatsByTier, setSeatsByTier] = useState({}); // Lưu ghế theo Tier (VIP, MID...)

  const [activeZone, setActiveZone] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [standingQty, setStandingQty] = useState({});

  const zoneColors = ["#bb69db", "#380c0c", "#F5DEB3", "#8D1B1B", "#00F0FF"];

  useEffect(() => {
    const initData = async () => {
      if (!id || id === "undefined") return;
      try {
        setLoading(true);
        const concertRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/concert/${id}`,
          { concert_id: id },
        );
        setConcert(concertRes.data?.data || concertRes.data);

        const zonesRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/zone`,
          { concert_id: id },
        );
        const allZones = zonesRes.data?.data || [];
        setZones(allZones);

        if (allZones.length > 0) setActiveZone(allZones[0].zone_id);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id]);

  useEffect(() => {
    const fetchSeats = async () => {
      if (!activeZone) return;
      const currentZone = zones.find((z) => z.zone_id === activeZone);

      if (currentZone?.has_seat_map) {
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/seat`, {
            concert_id: id,
            zone_id: activeZone,
          });
          if (res.data?.success) {
            setSeatsByTier(res.data.data);
          }
        } catch (err) {
          console.error("Lỗi lấy danh sách ghế", err);
          setSeatsByTier({});
        }
      } else {
        setSeatsByTier({});
      }
    };
    fetchSeats();
  }, [activeZone, id, zones]);

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

  // Vị trí hiển thị các Zone trên sơ đồ tổng quát
  const getZoneStyle = (index) => ({
    left: `${(index % 3) * 320 + 50}px`,
    top: `${Math.floor(index / 3) * 220 + 150}px`,
    width: "280px",
    height: "180px",
  });

  if (loading)
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center font-black">
        ĐANG TẢI...
      </div>
    );

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden font-sans">
      {/* CỘT TRÁI: SƠ ĐỒ TRỰC QUAN */}
      <div className="flex-[0.7] relative flex flex-col border-r border-gray-900 bg-black">
        {/* Header điều hướng */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black to-transparent">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:text-[#8D1B1B] font-black uppercase text-xs"
          >
            <HiOutlineChevronLeft size={24} /> Trở về
          </button>
          {/* Tiêu đề & hướng dẫn */}
          <div className="text-center">
            <h2 className="text-white text-xl font-black uppercase tracking-tighter">
              Sơ đồ sân khấu
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Nhấp vào khu vực để xem chi tiết
            </p>
          </div>
          <div className="w-20" />
        </div>
        {/* Khu vực chính giữa: Sơ đồ tổng quát & Chọn ghế chi tiết */}
        <div className="flex-1 flex items-center justify-center relative">
          <TransformWrapper minScale={0.1} initialScale={0.5} centerOnInit>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-3">
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
                    className="p-3 bg-[#8D1B1B] rounded-full shadow-lg shadow-red-900/40"
                  >
                    <HiRefresh size={20} />
                  </button>
                </div>
                {/* Sơ đồ tổng quát */}
                <TransformComponent wrapperClass="!w-full !h-full">
                  <div
                    className="relative bg-[#111] border border-gray-900 shadow-2xl rounded-lg"
                    style={{ width: 1100, height: 700 }}
                  >
                    {/* Sân khấu */}
                    <div
                      className="absolute bg-gray-700 flex items-center justify-center border-b-8 border-gray-600 rounded-b-xl shadow-xl"
                      style={{ left: 350, top: 20, width: 400, height: 80 }}
                    >
                      <span className="text-xl font-black text-gray-400 uppercase tracking-[0.5em]">
                        SÂN KHẤU
                      </span>
                    </div>

                    {/* Danh sách các khu vực (Zone) */}
                    {zones.map((zone, index) => {
                      const isActive = activeZone === zone.zone_id;
                      const style = getZoneStyle(index);
                      return (
                        <div
                          key={zone.zone_id}
                          onClick={() => setActiveZone(zone.zone_id)}
                          className={`absolute flex flex-col items-center justify-center cursor-pointer transition-all border-4 rounded-2xl p-4 text-center
                            ${isActive ? "bg-[#8D1B1B]/40 border-white scale-105 z-10 shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "bg-gray-900/60 border-gray-800 hover:border-gray-500"}`}
                          style={style}
                        >
                          <span className="font-black text-sm uppercase mb-1 tracking-tighter">
                            {zone.zone_name}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase mb-2">
                            {zone.has_seat_map
                              ? "(Chọn chỗ ngồi)"
                              : "(Khu đứng)"}
                          </span>
                          <span className="text-sm font-black text-[#FFD700] bg-black/40 px-3 py-1 rounded-full border border-yellow-600/30">
                            {zone.price} ETH
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>

          {/* Sơ đồ chọn ghế chi tiết hiện lên khi nhấn vào khu vực Ngồi */}
          {activeZone &&
            zones.find((z) => z.zone_id === activeZone)?.has_seat_map && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-black/90 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 shadow-2xl z-30 animate-fadeIn">
                <div className="flex justify-between items-center mb-4 px-4">
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">
                    Khu vực:{" "}
                    <span className="text-white">
                      {zones.find((z) => z.zone_id === activeZone)?.zone_name}
                    </span>
                  </h3>
                  <div className="flex gap-4 text-[10px] font-bold uppercase">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>{" "}
                      Trống
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>{" "}
                      Đang chọn
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div> Đã
                      bán
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-6 max-h-[250px] overflow-y-auto p-2 scrollbar-hide">
                  {Object.keys(seatsByTier).length > 0 ? (
                    Object.entries(seatsByTier).map(([tierName, seatList]) => (
                      <div
                        key={tierName}
                        className="flex flex-col items-center gap-2"
                      >
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                          {tierName}
                        </span>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {seatList.map((seat) => {
                            const isSelected = selectedSeats.some(
                              (s) => s.seat_id === seat.seat_id,
                            );
                            const isOccupied = seat.status !== "AVAILABLE";
                            return (
                              <button
                                key={seat.seat_id}
                                disabled={isOccupied}
                                onClick={() =>
                                  handleSeatClick(
                                    seat,
                                    zones.find((z) => z.zone_id === activeZone),
                                  )
                                }
                                className={`w-9 h-9 rounded-lg text-[10px] font-black transition-all border
                                ${
                                  isOccupied
                                    ? "bg-red-600 border-transparent text-white opacity-40 cursor-not-allowed"
                                    : isSelected
                                      ? "bg-green-500 border-white text-black scale-110 shadow-lg"
                                      : "bg-white text-black hover:bg-gray-200"
                                }`}
                              >
                                {seat.seat_label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 font-bold uppercase py-10">
                      Đang tải ghế...
                    </p>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* CỘT PHẢI: GIỎ HÀNG & THANH TOÁN */}
      <div className="flex-[0.3] bg-[#0F0F0F] flex flex-col p-8 border-l border-gray-900">
        <div className="mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-2 leading-tight">
            {concert?.concert?.title || concert?.title}
          </h1>
          <p className="text-gray-500 font-bold text-sm">
            📍 {concert?.venue?.name || "Địa điểm chưa xác định"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest mb-4">
            Hạng vé & Số lượng
          </p>
          {zones.map((zone, index) => {
            const isSelected = activeZone === zone.zone_id;
            const quantity = zone.has_seat_map
              ? selectedSeats.filter((s) => s.zone_id === zone.zone_id).length
              : standingQty[zone.zone_id] || 0;

            return (
              <div
                key={zone.zone_id}
                onClick={() => setActiveZone(zone.zone_id)}
                className={`p-5 rounded-2xl transition-all border-2 cursor-pointer ${isSelected ? "bg-[#1A1A1A] border-[#8D1B1B]" : "bg-transparent border-gray-900 hover:border-gray-800"}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-10 rounded-full"
                      style={{
                        backgroundColor: zoneColors[index % zoneColors.length],
                      }}
                    ></div>
                    <div>
                      <p className="font-black text-xs uppercase">
                        {zone.zone_name}
                      </p>
                      <p className="text-xs text-[#FFD700] font-black">
                        {zone.price} ETH
                      </p>
                      <p className="text-[9px] text-gray-500 font-bold">
                        CÒN TRỐNG: {zone.available_seats}
                      </p>
                    </div>
                  </div>
                  {!zone.has_seat_map ? (
                    <div className="flex items-center gap-3 bg-black rounded-full p-1.5 border border-gray-800">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStandingQty(
                            zone.zone_id,
                            -1,
                            zone.available_seats,
                          );
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-full text-gray-400 hover:text-white"
                      >
                        <HiMinus />
                      </button>
                      <span className="w-4 text-center font-black text-sm">
                        {quantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStandingQty(
                            zone.zone_id,
                            1,
                            zone.available_seats,
                          );
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-[#8D1B1B] rounded-full text-white"
                      >
                        <HiPlus />
                      </button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-2xl font-black text-white">
                        {quantity}
                      </span>
                      <span className="text-[8px] text-gray-500 font-bold uppercase ml-1">
                        vé
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-900 bg-[#0F0F0F]">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-black text-gray-600 uppercase mb-1">
                Tổng cộng (
                {selectedSeats.length +
                  Object.values(standingQty).reduce((a, b) => a + b, 0)}{" "}
                vé)
              </p>
              <p className="text-4xl font-black text-white">
                {calculateTotal()}{" "}
                <span className="text-xs text-gray-500 font-bold uppercase">
                  ETH
                </span>
              </p>
            </div>
          </div>
          <button
            disabled={calculateTotal() === 0}
            onClick={() =>
              navigate(`/concert/${id}/checkout`, {
                state: {
                  selectedSeats,
                  standingTickets: standingQty,
                  concert: concert?.concert || concert,
                  total: calculateTotal(),
                },
              })
            }
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all text-sm
              ${calculateTotal() > 0 ? "bg-[#8D1B1B] text-white shadow-xl shadow-red-900/30 hover:scale-105 active:scale-95" : "bg-gray-800 text-gray-600 cursor-not-allowed"}`}
          >
            Tiếp tục thanh toán <span className="ml-1">→</span>
          </button>
        </div>
      </div>
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Selection;
