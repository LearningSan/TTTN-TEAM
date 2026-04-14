import React, { useState } from "react"; // Đã thêm useEffect
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineLocationMarker, HiOutlineCalendar } from "react-icons/hi";
import { AiFillHome } from "react-icons/ai";
import { GiTicket } from "react-icons/gi";
import axios from "axios";

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const orderId = state?.orderId;

  const concert = state?.concert || {
    title: "Đang tải thông tin...",
    location: "",
    date: "",
  };

  const selectedSeats = state?.selectedSeats || [];

  const subtotal = selectedSeats.reduce(
    (sum, seat) => sum + (seat.price || 0),
    0,
  );

  // 1. Khởi tạo State lấy dữ liệu từ Local Storage
  // Thay thế đoạn khởi tạo useState cũ (khoảng dòng 28-36)
  const [customerInfo, setCustomerInfo] = useState(() => {
    // Logic này chỉ chạy DUY NHẤT một lần khi component mount
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser) {
        return {
          fullName:
            savedUser.name || savedUser.full_name || savedUser.username || "",
          email: savedUser.email || "",
          phone: savedUser.phone || "",
        };
      }
    } catch (error) {
      console.error("Lỗi đọc dữ liệu từ localStorage:", error);
    }

    // Giá trị mặc định nếu không có user trong storage
    return { fullName: "", email: "", phone: "" };
  });

  const handleContinue = async () => {
    console.log("Dữ liệu ghế gửi đi:", selectedSeats);
    const { fullName, email, phone } = customerInfo;

    if (!fullName || !email || !phone) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      // 1. Lấy thông tin User
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (!savedUser || !savedUser.user_id) {
        alert("Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }

      // 2. Kết nối ví MetaMask
      if (!window.ethereum) return alert("Vui lòng cài đặt MetaMask!");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userWallet = accounts[0];

      // 3. Bước 1: Gọi API tạo Đơn hàng (Order)
      const orderRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/order`,
        {
          user_id: savedUser.user_id,
          concert_id: state?.concertId,
          currency: "USDT",
          items: selectedSeats.map((s) => ({
            // SỬA TẠI ĐÂY: Dùng s.zone_id thay vì biến khác
            zone_id: s.zone_id,
            seat_id: s.seat_id,
            quantity: 1,
          })),
          note: `Khách hàng: ${fullName}`,
        },
        { withCredentials: true },
      );
      if (orderRes.data?.success) {
        const newOrderId = orderRes.data.data.order_id;

        // 4. Bước 2: Gọi API tạo thông tin Thanh toán (Payment Transaction)
        // Bước này cực kỳ quan trọng để lấy được payment_id
        const paymentRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/payment`,
          {
            order_id: newOrderId,
            amount: subtotal,
            currency: "USDT",
            from_wallet: userWallet,
            to_wallet: import.meta.env.VITE_WALLET_ADDRESS,
          },
          { withCredentials: true },
        );

        // 5. Nếu tạo payment thành công, chuyển sang trang thanh toán thực tế
        if (paymentRes.data?.success) {
          navigate("/payment", {
            state: {
              orderId: newOrderId,
              paymentId: paymentRes.data.data.payment_id, // payment_id lấy từ kết quả API
              amount: subtotal,
              concert: concert, // Truyền tiếp thông tin concert sang trang sau
            },
          });
        }
      }
    } catch (error) {
      console.error("Lỗi Checkout:", error);
      alert(
        "Lỗi: " + (error.response?.data?.message || "Kiểm tra lại dữ liệu"),
      );
    }
  };
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-900">
      {/* Header - Giữ nguyên của bạn */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="text-3xl font-black tracking-tighter text-[#8D1B1B]"
          >
            TICKETX.
          </Link>
          <nav className="flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-bold hover:text-[#8D1B1B] transition-colors flex items-center gap-2"
            >
              <AiFillHome size={18} /> TRANG CHỦ
            </Link>
          </nav>
        </div>
      </header>

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
                  {concert.title}
                </h4>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <HiOutlineLocationMarker size={14} /> {concert.location}
                  </p>
                  <p className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <HiOutlineCalendar size={14} /> {concert.date}
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
                className="w-full bg-[#8D1B1B] text-white font-black py-4 rounded-xl text-lg hover:bg-black transition-all uppercase shadow-md"
              >
                Tiếp tục thanh toán
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
