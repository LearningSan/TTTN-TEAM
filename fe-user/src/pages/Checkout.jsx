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
    <div className="min-h-screen bg-[#111827] text-white p-6 md:p-12 font-sans">
      <main className="max-w-5xl mx-auto space-y-8">
        {/* Banner thông tin sự kiện */}

        <div className="border-2 border-[#EB2E91] rounded-2xl p-6 bg-black">
          <h2 className="text-[#EB2E91] text-xl font-bold uppercase tracking-wide">
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

        <div className="grid lg:grid-cols-[1fr,380px] gap-8 items-start">
          {/* Cột trái: Form thông tin */}
          <div className="border-2 border-[#00A991] rounded-2xl p-6 bg-black h-full">
            <h3 className="text-[#00A991] text-lg font-bold mb-6">
              Information Form
            </h3>
            <div className="bg-white text-black p-6 rounded-xl space-y-5">
              <div className="bg-gray-200 px-4 py-2 rounded text-sm font-bold text-gray-700">
                Ticket Holder Information
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Full name
                  </label>
                  <div className="relative">
                    <FaUserAlt className="absolute left-3 top-3 text-gray-400 size-3" />
                    <input
                      type="text"
                      readOnly
                      value={customerInfo.fullName}
                      className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 pl-10 text-sm outline-none text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 text-gray-400 size-3" />
                    <input
                      type="text"
                      readOnly
                      value={customerInfo.email}
                      className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 pl-10 text-sm outline-none text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FaPhoneAlt className="absolute left-3 top-3 text-gray-400 size-3" />
                    <input
                      type="text"
                      readOnly
                      value={customerInfo.phone}
                      className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 pl-10 text-sm outline-none text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Thông tin vé & Tổng tiền */}
          <div className="bg-white text-black p-6 rounded-2xl shadow-xl">
            <h3 className="font-bold text-center text-gray-800 mb-6 border-b pb-4">
              Ticket Information
            </h3>

            <div className="max-h-60 overflow-y-auto mb-4">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-gray-400 border-b">
                    <th className="text-left font-bold py-2">Ticket type</th>
                    <th className="text-right font-bold py-2">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedSeats.map((seat) => (
                    <tr key={seat.seat_id}>
                      <td className="py-3 pr-2">
                        <div className="font-bold text-gray-700">
                          Khu {seat.zone_name}
                        </div>
                        <div className="text-gray-500">
                          - Ghế {seat.seat_label}
                        </div>
                        <div className="text-gray-400 text-xs italic">
                          ({seat.tier_name})
                        </div>
                        <div className="text-[#EB2E91] font-semibold">
                          {seat.price} ETH
                        </div>
                      </td>
                      <td className="text-right font-bold py-3">1</td>
                    </tr>
                  ))}
                  {Object.entries(standingTickets).map(
                    ([zoneId, qty]) =>
                      qty > 0 && (
                        <tr key={zoneId}>
                          <td className="py-3 pr-2">
                            <div className="font-bold text-gray-700">
                              Vé đứng (Khu {zoneId})
                            </div>
                            <div className="text-[#EB2E91] font-semibold">
                              {(0.0001).toFixed(4)} ETH
                            </div>
                          </td>
                          <td className="text-right font-bold py-3">{qty}</td>
                        </tr>
                      ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center font-bold text-sm border-t-2 border-dashed border-gray-200 pt-5 mb-6">
              <span className="text-gray-600 uppercase">Subtotal</span>
              <span className="text-2xl text-[#F24E61] tracking-tighter">
                {totalAmount} <span className="text-sm">ETH</span>
              </span>
            </div>

            <button
              onClick={handleContinue}
              disabled={loading}
              className="w-full bg-[#EB2E91] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all hover:bg-[#c9267c] active:scale-95 disabled:opacity-50"
            >
              {loading ? "Processing..." : "CONTINUE"}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full mt-4 text-[11px] text-gray-400 font-bold text-center underline hover:text-gray-600"
            >
              Re-select ticket
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
