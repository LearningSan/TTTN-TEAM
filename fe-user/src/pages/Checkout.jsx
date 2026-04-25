import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineLocationMarker, HiOutlineCalendar } from "react-icons/hi";
import { GiTicket } from "react-icons/gi";
import { FaWallet } from "react-icons/fa"; // 1. Thêm import icon
import { ethers } from "ethers"; // 2. Thêm import ethers
import axios from "axios";

const Checkout = () => {
  const { state } = useLocation();
  console.log("Dữ liệu nhận được từ Link/Navigate:", state);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const selectedSeats = state?.selectedSeats || [];
  const concert = state?.concert || null;
  const concertId = state?.concertId;

  const subtotal = selectedSeats.reduce(
    (sum, seat) => sum + (seat.price || 0),
    0,
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Đang cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Khởi tạo thông tin khách hàng từ Local Storage
  const [customerInfo, setCustomerInfo] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      return {
        fullName:
          savedUser?.name || savedUser?.full_name || savedUser?.username || "",
        email: savedUser?.email || "",
        phone: savedUser?.phone || "",
        // Lấy ví từ LocalStorage thay vì dùng biến customerInfo chưa tồn tại
        walletAddress:
          savedUser?.wallet_address ||
          "0x0000000000000000000000000000000000000000",
      };
    } catch (e) {
      console.error("Lỗi lấy dữ liệu từ LocalStorage:", e);
      return { fullName: "", email: "", phone: "", walletAddress: "" };
    }
  });

  // Kiểm tra nếu không có state (do reload trang hoặc truy cập trực tiếp)
  if (!state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-black">
        <p className="mb-4 text-red-600">
          Dữ liệu đơn hàng bị mất do bạn vừa tải lại trang.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-black text-white px-6 py-2 rounded-lg"
        >
          Về trang chủ chọn lại ghế
        </button>
      </div>
    );
  }

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

      // --- BƯỚC MỚI: XÁC THỰC CHỮ KÝ VÍ VỚI SERVER ---
      // 1. Lấy nonce từ server
      const nonceRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/wallet/nonce`,
        {
          withCredentials: true,
        },
      );

      // 2. Ký message nonce
      const signature = await signer.signMessage(nonceRes.data.message);

      // 3. Gửi verify để server lưu địa chỉ ví vào session/cookie
      await axios.post(
        `${import.meta.env.VITE_API_URL}/wallet/verify`,
        {
          wallet_address: walletAddress,
          signature: signature,
          message: nonceRes.data.message,
        },
        { withCredentials: true },
      );

      // --- BƯỚC TẠO ORDER (Bây giờ đã có đủ Auth và Wallet Verify) ---
      const items = selectedSeats.map((seat) => ({
        zone_id: seat.zone_id,
        seat_id: seat.seat_id,
        quantity: 1,
      }));

      const orderRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/order`,
        {
          concert_id: concertId,
          currency: "ETH",
          items: items,
          wallet_address: walletAddress,
        },
        { withCredentials: true },
      );

      if (orderRes.data?.success) {
        const orderData = orderRes.data.data;

        // Bước 5: Tạo Payment
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
      console.error("Lỗi Checkout:", error);
      const msg =
        error.response?.data?.message ||
        "Không thể khởi tạo đơn hàng. Vui lòng kiểm tra lại kết nối ví.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-900">
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Customer Information */}
          <div className="lg:w-2/3">
            <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#8D1B1B] rounded-full"></span>
              THÔNG TIN KHÁCH HÀNG
            </h2>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={customerInfo.fullName} // Đã gắn value
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        fullName: e.target.value,
                      })
                    }
                    placeholder="Nhập họ và tên"
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email} // Đã gắn value
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        email: e.target.value,
                      })
                    }
                    placeholder="example@gmail.com"
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={customerInfo.phone} // Đã gắn value
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                    maxLength={10}
                    placeholder="0901234567"
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (Giữ nguyên giao diện của bạn) */}
          <div className="lg:w-1/3">
            {/* ... Phần Order Summary giữ nguyên như file cũ của bạn ... */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-900 sticky top-28">
              <h3 className="text-xl font-black mb-6 uppercase italic">
                Tóm tắt đơn hàng
              </h3>
              {/* Concert Info */}
              <div className="mb-6">
                <h4 className="font-black text-[#8D1B1B] text-lg leading-tight mb-2">
                  {concert?.title}
                </h4>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <HiOutlineLocationMarker size={14} />{" "}
                    {concert?.venue_name || "Chưa xác định địa điểm"}
                  </p>
                  <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <HiOutlineCalendar size={14} /> {formatDate(concert?.date)}
                  </p>
                </div>
              </div>

              {/* Selected Seats List */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                {selectedSeats.map((seat, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-xl border border-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <GiTicket className="text-[#8D1B1B]" size={20} />
                        <span className="text-sm font-black px-2 py-1 bg-white rounded border border-gray-200">
                          {seat.seat_label}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-[#8D1B1B]">
                          {seat.price.toLocaleString()} đ
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-400 pt-4 mb-6">
                <div className="flex justify-between items-center font-black">
                  <span>Tổng tiền</span>
                  <span className="text-[#8D1B1B] text-xl">
                    {subtotal.toLocaleString()} đ
                  </span>
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={loading}
                className="w-full bg-[#8D1B1B] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
              >
                {loading ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <FaWallet /> Kết nối ví & Tiếp tục
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
