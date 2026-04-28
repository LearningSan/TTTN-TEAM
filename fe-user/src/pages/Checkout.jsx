import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineLocationMarker, HiOutlineCalendar } from "react-icons/hi";
import { FaUserAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { ethers } from "ethers";
import axios from "axios";

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Lấy dữ liệu từ state được truyền sang từ trang chọn vé
  const selectedSeats = state?.selectedSeats || [];
  const standingTickets = state?.standingTickets || {};
  const zones = state?.zones || [];
  const concert = state?.concert || null;
  const totalAmount = state?.total || 0;

  // Hàm định dạng ngày tháng sang tiếng Việt
  const formatDate = (dateString) => {
    if (!dateString) return "Đang cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const [customerInfo] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      return {
        fullName: savedUser?.name || savedUser?.full_name || "Khách hàng",
        email: savedUser?.email || "Chưa cập nhật",
        phone: savedUser?.phone || "Chưa cập nhật",
      };
    } catch (e) {
      return { fullName: "", email: "", phone: "" };
    }
  });

  const handleContinue = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài đặt MetaMask!");
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      // Chuẩn bị dữ liệu vé để gửi lên backend
      const seatItems = selectedSeats.map((s) => ({
        zone_id: s.zone_id,
        seat_id: s.seat_id,
        quantity: 1,
      }));
      const standingItems = Object.entries(standingTickets)
        .filter(([_, qty]) => qty > 0)
        .map(([zoneId, qty]) => ({
          zone_id: zoneId,
          seat_id: null, // ĐẢM BẢO vé đứng thì seat_id là null để tránh Backend bị nhầm
          quantity: qty,
        }));

      const allItems = [...seatItems, ...standingItems];

      const nonceRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/wallet/nonce`,
        { withCredentials: true },
      );
      const signature = await signer.signMessage(nonceRes.data.message);

      // Bây giờ log ở đây sẽ không bị lỗi ReferenceError nữa
      console.log("Dữ liệu chuẩn bị gửi đi:", allItems);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/wallet/verify`,
        {
          wallet_address: walletAddress,
          signature: signature,
          message: nonceRes.data.message,
        },
        { withCredentials: true },
      );

      const orderRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/order`,
        {
          concert_id: concert?.concert_id || state?.id,
          currency: "ETH",
          items: allItems, // Sử dụng allItems đã khai báo phía trên
          wallet_address: walletAddress,
        },
        { withCredentials: true, timeout: 30000 },
      );

      if (orderRes.data?.success) {
        const orderData = orderRes.data.data;
        const paymentRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/payment`,
          {
            order_id: orderData.order_id,
            from_wallet: walletAddress,
            to_wallet: import.meta.env.VITE_WALLET_ADDRESS,
          },
          { withCredentials: true },
        );

        if (paymentRes.data?.success) {
          navigate("/payment", {
            state: {
              orderId: orderData.order_id,
              paymentId: paymentRes.data.data.payment_id,
              amount: orderData.total_amount,
              walletAddress: walletAddress,
              concert: concert,
              selectedSeats: selectedSeats,
              standingTickets: standingTickets,
              zones: zones
            },
          });
        }
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi xử lý thanh toán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white p-6 md:p-12 font-anton tracking-wide">
      <main className="max-w-5xl mx-auto space-y-8">
        {/* Banner thông tin sự kiện */}

        <div className="border-2 border-[#EB2E91] rounded-2xl p-6 bg-black">
          <h2 className="text-[#EB2E91] text-xl font-anton uppercase tracking-wide">
            {concert?.title || "Tên sự kiện chưa cập nhật"}
          </h2>
          <div className="mt-4 space-y-2 text-gray-300 text-sm">
            {/* Hiển thị Địa điểm */}
            <div className="flex items-center gap-3">
              <HiOutlineLocationMarker className="text-[#EB2E91] text-lg" />
              <span>{concert?.venue_name || "Địa điểm đang cập nhật"}</span>
            </div>

            {/* Hiển thị Thời gian - Sử dụng hàm formatDate có sẵn trong file */}
            <div className="flex items-center gap-3">
              <HiOutlineCalendar className="text-[#EB2E91] text-lg" />
              <span>{formatDate(concert?.concert_date)}</span>
            </div>
          </div>
        </div>

        {/* Bảng Form & Ticket Info chung trong 1 khung */}
        <div className="relative group mt-12">
          {/* Viền sáng tổng thể bên ngoài */}
          <div className="absolute inset-0 bg-[#00E5FF]/30 blur-[20px] pointer-events-none rounded-[30px]" />
          
          <div className="relative border-2 border-[#00E5FF] rounded-[30px] p-6 md:p-8 lg:p-12 bg-black shadow-[0_0_40px_rgba(0,229,255,0.15)] z-10">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
              {/* Cột trái: Form thông tin */}
              <div className="h-full">
                <h3 className="text-[#00E5FF] text-xl font-anton tracking-wide mb-6">
                  Information Form
                </h3>

                <div className="bg-white text-black rounded-[24px] overflow-hidden shadow-inner border border-gray-200 font-sans">
                  {/* Tiêu đề xám */}
                  <div className="bg-[#A0A0A0] px-8 py-4 text-center">
                    <span className="text-black font-black text-lg tracking-wide">Ticket Type</span>
                  </div>

                  <div className="p-8 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2 tracking-wide">
                        Full name
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={customerInfo.fullName}
                        placeholder="deniel123@gmail.com"
                        className="w-full bg-white border border-gray-400 rounded-lg p-3 text-sm outline-none text-[#A0C4FF] font-medium placeholder-[#A0C4FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2 tracking-wide">
                        Email
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={customerInfo.email}
                        placeholder="deniel123@gmail.com"
                        className="w-full bg-white border border-gray-400 rounded-lg p-3 text-sm outline-none text-[#A0C4FF] font-medium placeholder-[#A0C4FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2 tracking-wide">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={customerInfo.phone}
                        placeholder="deniel123@gmail.com"
                        className="w-full bg-white border border-gray-400 rounded-lg p-3 text-sm outline-none text-[#A0C4FF] font-medium placeholder-[#A0C4FF]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải: Thông tin vé & Tổng tiền */}
              <div className="h-full flex flex-col font-sans">
                <div className="bg-white text-black p-8 rounded-[30px] flex-1 flex flex-col shadow-lg border border-gray-100">
                  <h3 className="font-anton text-2xl text-center text-black mb-6 tracking-widest">
                    Ticket Information
                  </h3>

                  <div className="flex-1 overflow-y-auto mb-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th className="text-left font-anton text-lg tracking-wider py-3">Ticket type</th>
                          <th className="text-right font-anton text-lg tracking-wider py-3">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedSeats.map((seat) => (
                          <tr key={seat.seat_id}>
                            <td className="py-4 pr-2">
                              <div className="font-medium text-sm text-gray-600 mb-1">
                                {seat.tier_name || "VIP"}
                              </div>
                              <div className="text-black font-medium mb-1">
                                {seat.price.toLocaleString()} đ
                              </div>
                              <div className="text-black font-medium text-sm">
                                Khu {seat.zone_name} - Ghế {seat.seat_label}
                              </div>
                            </td>
                            <td className="text-right font-medium py-4 align-top">01</td>
                          </tr>
                        ))}
                        {Object.entries(standingTickets).map(
                          ([zoneId, qty]) =>
                            qty > 0 && (
                              <tr key={zoneId}>
                                <td className="py-4 pr-2">
                                  <div className="font-medium text-sm text-gray-600 mb-1">
                                    STANDING
                                  </div>
                                  <div className="text-black font-medium mb-1">
                                    {(zones.find(z => String(z.zone_id) === String(zoneId))?.price || 0).toLocaleString()} đ
                                  </div>
                                  <div className="text-black font-medium text-sm">
                                    Khu {zones.find(z => String(z.zone_id) === String(zoneId))?.name || zoneId}
                                  </div>
                                </td>
                                <td className="text-right font-medium py-4 align-top">
                                  {qty < 10 ? `0${qty}` : qty}
                                </td>
                              </tr>
                            ),
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center font-anton text-xl border-t border-dashed border-gray-400 pt-6 mb-6">
                    <span className="text-black tracking-wider">Subtotal</span>
                    <span className="text-[#FF2D95] tracking-wider font-sans font-black">
                      {totalAmount.toLocaleString()} đ
                    </span>
                  </div>

                  <button
                    onClick={handleContinue}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#FFA0CB] to-[#FF69B4] text-black py-4 font-black text-sm uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 border border-[#FF2D95]"
                  >
                    {loading ? "Processing..." : "CONTINUE"}
                  </button>

                  <button
                    onClick={() => navigate(-1)}
                    className="w-full mt-4 text-xs text-gray-500 font-medium text-center hover:text-gray-800"
                  >
                    Re-select ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
