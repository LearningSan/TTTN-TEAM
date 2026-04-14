import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { HiOutlineChevronLeft } from "react-icons/hi";

const SeatSelection = () => {
  const { concertId, zoneId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [concertDetail, setConcertDetail] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Bước 1: Lấy danh sách tất cả Zone của concert này
        const zonesRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/zone`,
          { concert_id: concertId },
          { withCredentials: true },
        );

        if (zonesRes.data?.success) {
          // Dữ liệu zone thường nằm trong data.data hoặc data
          const allZones = zonesRes.data.data || [];

          // Bước 2: Gọi API lấy ghế cho TỪNG zone một lúc
          const seatRequests = allZones.map((zone) =>
            axios.post(`${import.meta.env.VITE_API_URL}/seat`, {
              concert_id: concertId,
              zone_id: zone.zone_id, // Gửi từng zone_id theo yêu cầu của BE
            }),
          );

          const seatResponses = await Promise.all(seatRequests);

          // Bước 3: Gộp tất cả kết quả vào một Object duy nhất để render
          let combinedSeats = {};
          // SeatSelection.jsx

          seatResponses.forEach((res, index) => {
            if (res.data?.success) {
              // Lấy zone_id thực tế mà bạn đã dùng để gửi yêu cầu (Chắc chắn có dữ liệu)
              const currentZoneId = allZones[index].zone_id;

              // Duyệt qua dữ liệu ghế trả về và ép zone_id vào từng ghế
              const tiersWithFixedZone = {};
              Object.entries(res.data.data).forEach(([tierName, seatList]) => {
                tiersWithFixedZone[tierName] = seatList.map((seat) => ({
                  ...seat,
                  zone_id: currentZoneId, // Bổ sung zone_id vào đối tượng ghế
                }));
              });

              combinedSeats = { ...combinedSeats, ...tiersWithFixedZone };
            }
          });

          setSeats(combinedSeats);
        }

        // 3. Lấy thông tin Concert (giữ nguyên code cũ của bạn)
        const concertRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/concert/${concertId}`,
          { concert_id: concertId },
        );
        if (concertRes.data?.success) {
          const apiData = concertRes.data.data;
          setConcertDetail({
            ...apiData.concert,
            venue_name: apiData.venue?.name,
          });
        }
      } catch (error) {
        console.error("Lỗi fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [concertId]); // Bỏ zoneId khỏi dependency để không bị load lại khi đổi zone trên URL
  // Xử lý chọn/bỏ chọn ghế
  const toggleSeat = (seat) => {
    if (seat.status !== "AVAILABLE") return; // Ghế đã bị khóa hoặc đã bán thì không chọn được

    setSelectedSeats((prev) =>
      prev.find((s) => s.seat_id === seat.seat_id)
        ? prev.filter((s) => s.seat_id !== seat.seat_id)
        : [...prev, seat],
    );
  };

  // SeatSelection.jsx - Dòng 83
  const handleBooking = () => {
    if (selectedSeats.length === 0) return alert("Vui lòng chọn ghế!");

    navigate(`/checkout`, {
      state: {
        concertId: concertId,
        selectedSeats: selectedSeats.map((s) => ({
          seat_id: s.seat_id,
          seat_label: s.seat_label,
          price: s.price,
          tier_id: s.tier_id,
          zone_id: s.zone_id, // Bây giờ sẽ lấy giá trị từ s đã được ép ở Bước 1
        })),
        concert: {
          title: concertDetail?.title || "Tên buổi hòa nhạc",
          location: concertDetail?.venue_name || "Địa điểm tổ chức",
          date: concertDetail?.concert_date
            ? new Date(concertDetail.concert_date).toLocaleString("vi-VN")
            : "Thời gian diễn ra",
        },
      },
    });
  };

  // Tìm đến đoạn Render giá (khoảng dòng 170)
  // Sửa hiển thị giá từ USDT sang VND nếu bạn muốn khớp với giao diện đỏ TicketX
  const formatPrice = (price) => {
    return price ? `${price.toLocaleString()} đ` : "N/A";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#111] text-white flex items-center justify-center">
        Đang tải sơ đồ ghế...
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans">
      {/* PHẦN TRÁI: SƠ ĐỒ GHẾ */}
      <div className="flex-1 p-8 relative flex flex-col items-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 text-green-500 font-bold"
        >
          <HiOutlineChevronLeft size={24} /> Trở về
        </button>

        <h2 className="text-green-500 text-xl font-bold mb-10">Chọn ghế</h2>

        {/* Chú thích màu sắc */}
        <div className="flex gap-6 mb-12 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded-sm"></div> Đang trống
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-sm"></div> Đang chọn
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-sm"></div> Không chọn
            được
          </div>
        </div>

        {/* Khu vực Stage */}
        <div className="w-64 py-2 bg-gray-600 text-center rounded-lg mb-16 font-bold text-gray-300">
          STAGE
        </div>

        {/* Tìm đến đoạn hiển thị sơ đồ ghế (khoảng dòng 130) */}
        <div className="w-full max-w-5xl space-y-12">
          {Object.keys(seats).length > 0 ? (
            // Duyệt qua từng Tier (Khu vực) trong Object
            Object.entries(seats).map(([tierName, seatList]) => (
              <div key={tierName} className="space-y-4">
                {/* Hiển thị tên khu vực và số lượng ghế */}
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">
                    {tierName}
                  </h3>
                  <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
                    {seatList.length} Ghế
                  </span>
                </div>

                {/* Grid ghế riêng cho khu vực này */}
                <div className="grid grid-cols-10 md:grid-cols-12 gap-3 p-6 bg-[#1A1A1A] rounded-2xl border border-gray-800 shadow-inner">
                  {seatList.map((seat) => (
                    <div
                      key={seat.seat_id}
                      onClick={() =>
                        seat.status === "AVAILABLE" && toggleSeat(seat)
                      }
                      className={`w-10 h-10 rounded-md flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all
                ${
                  seat.status !== "AVAILABLE"
                    ? "bg-red-600 opacity-40 cursor-not-allowed text-white"
                    : selectedSeats.find((s) => s.seat_id === seat.seat_id)
                      ? "bg-green-500 shadow-[0_0_15px_#22c55e] text-white scale-110"
                      : "bg-white text-black hover:bg-gray-200"
                }`}
                    >
                      {seat.seat_label}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-500 italic">
              Đang tải sơ đồ ghế theo từng khu vực...
            </div>
          )}
        </div>
      </div>

      {/* PHẦN PHẢI: THÔNG TIN VÉ & THANH TOÁN */}
      <div className="w-full md:w-96 bg-[#1A1A1A] border-l border-gray-800 p-8 flex flex-col">
        <h3 className="text-lg font-bold mb-6 italic uppercase">
          Chi tiết lựa chọn
        </h3>

        <div className="flex-1 space-y-4 overflow-y-auto max-h-[60vh]">
          {selectedSeats.length > 0 ? (
            selectedSeats.map((s) => (
              <div
                key={s.seat_id}
                className="flex justify-between items-center bg-[#2A2A2A] p-4 rounded-lg border-l-4 border-green-500"
              >
                <div>
                  <p className="font-black text-white">Ghế: {s.seat_label}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">
                    Khu vực: {s.tier_name || "Phổ thông"}
                  </p>
                </div>
                <span className="text-green-500 font-black">
                  {formatPrice(s.price)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic text-center py-20">
              Chưa có ghế nào được chọn
            </p>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">
              Tổng cộng
            </span>
            <span className="text-2xl font-black text-white">
              {/* Tính tổng tiền thật */}
              {selectedSeats
                .reduce((sum, s) => sum + (s.price || 0), 0)
                .toLocaleString()}{" "}
              đ
            </span>
          </div>

          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0}
            className={`w-full py-4 rounded-xl font-black text-lg transition-all uppercase
              ${
                selectedSeats.length > 0
                  ? "bg-[#8D1B1B] text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(141,27,27,0.4)]"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
          >
            {selectedSeats.length > 0
              ? `Xác nhận ${selectedSeats.length} vé »`
              : "Vui lòng chọn ghế"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default SeatSelection;
