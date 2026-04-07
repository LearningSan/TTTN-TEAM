import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { HiOutlineChevronLeft } from "react-icons/hi";

const SeatSelection = () => {
  const { concertId, zoneId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);

        // 1. Chuyển sang phương thức POST
        // 2. Sửa endpoint thành /api/seat (không có 's')
        // 3. Truyền dữ liệu vào body thay vì params
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/seat`,
          {
            concert_id: concertId,
            zone_id: zoneId,
          },
        );

        if (response.data?.success) {
          // Đảm bảo dữ liệu là một mảng để map() hoạt động
          const data = response.data.data;
          setSeats(Array.isArray(data) ? data : [data]);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách ghế:", error.response);
        setSeats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [zoneId]);

  // Xử lý chọn/bỏ chọn ghế
  const toggleSeat = (seat) => {
    if (seat.status !== "AVAILABLE") return; // Ghế đã bị khóa hoặc đã bán thì không chọn được

    setSelectedSeats((prev) =>
      prev.find((s) => s.seat_id === seat.seat_id)
        ? prev.filter((s) => s.seat_id !== seat.seat_id)
        : [...prev, seat],
    );
  };

  // Tạo đơn hàng
  const handleBooking = async () => {
    if (selectedSeats.length === 0)
      return alert("Vui lòng chọn ít nhất một ghế!");

    try {
      const orderData = {
        concert_id: concertId,
        currency: "USDT",
        note: "Đặt vé qua web",
        items: selectedSeats.map((s) => ({
          zone_id: zoneId,
          seat_id: s.seat_id,
          quantity: 1,
        })),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/order`,
        orderData,
        { withCredentials: true },
      );
      if (response.data?.success) {
        alert("Tạo đơn hàng thành công!");
        //Chuyển sang Checkout
        navigate(`/checkout`, {
          state: {
            orderId: response.data.data.order.order_id,
            selectedSeats: selectedSeats.map((s) => ({
              ...s,
              // Đảm bảo có zone_name và price để Checkout hiển thị
              zone_name: s.zone_name || "VIP",
              price: s.price || 0,
            })),
            concert: {
              title: "Tên buổi hòa nhạc của bạn", // Bạn có thể lấy từ dữ liệu concert hiện tại
              location: "Địa điểm tổ chức",
              date: "Thời gian diễn ra",
            },
          },
        });
      }
    } catch (error) {
      alert("Lỗi khi tạo đơn hàng. Vui lòng thử lại!");
    }
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

        {/* Grid hiển thị ghế động dựa trên API */}
        {/* Phần hiển thị sơ đồ ghế động */}
        <div className="flex-1 flex justify-center items-center p-10 bg-black">
          <div className="grid grid-cols-8 gap-3">
            {" "}
            {/* Bạn có thể chỉnh số cột tùy theo quy mô sân khấu */}
            {seats.length > 0 ? (
              seats.map((seat) => (
                <div
                  key={seat.seat_id}
                  onClick={() =>
                    seat.status === "AVAILABLE" && toggleSeat(seat)
                  }
                  className={`w-10 h-10 rounded-md flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all
            ${
              seat.status !== "AVAILABLE"
                ? "bg-red-600 opacity-50 cursor-not-allowed"
                : selectedSeats.find((s) => s.seat_id === seat.seat_id)
                  ? "bg-green-500"
                  : "bg-white text-black"
            }`}
                >
                  {seat.seat_label}
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                Dữ liệu ghế đang trống. Hãy kiểm tra API `/api/seats/${zoneId}`
              </p>
            )}
          </div>
        </div>
      </div>

      {/* PHẦN PHẢI: THÔNG TIN VÉ & THANH TOÁN */}
      <div className="w-full md:w-96 bg-[#1A1A1A] border-l border-gray-800 p-8 flex flex-col">
        <h3 className="text-lg font-bold mb-6">Chi tiết lựa chọn</h3>

        <div className="flex-1 space-y-4">
          {selectedSeats.length > 0 ? (
            selectedSeats.map((s) => (
              <div
                key={s.seat_id}
                className="flex justify-between items-center bg-[#2A2A2A] p-4 rounded-lg border-l-4 border-green-500"
              >
                <div>
                  <p className="font-bold">Ghế: {s.seat_label}</p>
                  <p className="text-xs text-gray-400">Hàng: {s.row_label}</p>
                </div>
                <span className="text-green-500 font-bold">Free</span>
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
            <span className="text-gray-400 font-bold uppercase text-sm">
              Tổng cộng
            </span>
            <span className="text-2xl font-black text-white">
              {selectedSeats.length} Vé
            </span>
          </div>

          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all
              ${selectedSeats.length > 0 ? "bg-white text-black hover:bg-green-500 hover:text-white" : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}
          >
            {selectedSeats.length > 0
              ? "Tiếp tục đặt vé »"
              : "Vui lòng chọn ghế"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
