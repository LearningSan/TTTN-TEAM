import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineLocationMarker, HiOutlineCalendar } from "react-icons/hi";
import { AiFillHome } from "react-icons/ai";
import { GiTicket } from "react-icons/gi";
import axios from "axios";

const Checkout = () => {
  const { state } = useLocation(); // Nhận dữ liệu concert và selectedSeats từ trang trước
  const navigate = useNavigate();
  const orderId = state?.orderId;
  // Lấy dữ liệu concert từ state, nếu không có mới dùng object rỗng để tránh lỗi giao diện
  const concert = state?.concert || {
    title: "Đang tải thông tin...",
    location: "",
    date: "",
  };

  // Lấy danh sách ghế từ state
  const selectedSeats = state?.selectedSeats || [];

  const subtotal = selectedSeats.reduce(
    (sum, seat) => sum + (seat.price || 0),
    0,
  );
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // Trong Checkout.jsx - Cập nhật hàm handleContinue
  const handleContinue = async () => {
    const { fullName, email, phone } = customerInfo;
    if (!fullName || !email || !phone) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert(
        "Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số (bắt đầu bằng số 0).",
      );
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Định dạng Email không hợp lệ!");
      return;
    }

    try {
      // CHUYỂN VIỆC TẠO ĐƠN HÀNG SANG ĐÂY
      const orderData = {
        concert_id: state?.concertId, // Lấy từ state truyền qua
        currency: "USDT",
        note: `Khách hàng: ${customerInfo.fullName} - SĐT: ${customerInfo.phone}`,
        items: selectedSeats.map((s) => ({
          zone_id: state?.zoneId,
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
        alert("Đặt vé thành công!");
        // Sau khi tạo đơn thành công mới chuyển sang trang thành công
        navigate(`/order-success/${response.data.data.order.order_id}`);
      }
    } catch (error) {
      console.error("Lỗi tạo đơn hàng:", error);
      alert("Lỗi khi tạo đơn hàng. Vui lòng thử lại!");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      <main className="max-w-5xl mx-auto mt-10 px-4">
        {/* Banner thông tin Concert */}
        <div className="bg-[#D39696] rounded-3xl p-8 shadow-2xl mb-10 text-white relative">
          <h2 className="text-xl font-black uppercase mb-4">{concert.title}</h2>
          <div className="space-y-3 text-sm font-medium opacity-90">
            <p className="flex items-center gap-3">
              <HiOutlineLocationMarker size={20} /> {concert.location}
            </p>
            <p className="flex items-center gap-3">
              <HiOutlineCalendar size={20} /> {concert.date}
            </p>
          </div>
        </div>

        {/* Khối Thông tin Form & Ticket Information */}
        <div className="bg-black rounded-[40px] p-10 flex flex-col md:flex-row gap-10 shadow-2xl">
          {/* Cột trái: Information Form */}
          <div className="flex-1">
            <h3 className="text-white font-black text-xl mb-6 italic uppercase">
              Information Form
            </h3>
            <div className="bg-white rounded-[30px] overflow-hidden pb-8 space-y-6">
              <div className="bg-[#9CA3AF] text-black font-black py-4 px-10 w-full mb-6 text-lg uppercase tracking-wider">
                Ticket Type
              </div>
              <div className="px-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-black mb-2 ml-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      placeholder="deniel123@gmail.com"
                      className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none"
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          fullName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black mb-2 ml-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="deniel123@gmail.com"
                      className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none"
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black mb-2 ml-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      maxLength={10} // Giới hạn tối đa 10 ký tự
                      placeholder="0901234567" // Sửa placeholder cho đúng ví dụ SĐT
                      className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none"
                      onKeyPress={(e) => {
                        // Chỉ cho phép nhập số
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          phone: e.target.value,
                        })
                      }
                    />
                    {/* <p className="text-[10px] text-red-500 mt-1 ml-2 italic">
                    * Số điện thoại gồm 10 chữ số.
                  </p> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Cột phải: Ticket Information */}
          <div className="w-full md:w-80">
            <div className="bg-white rounded-[30px] border-4 border-[#31A1EE] p-6 flex flex-col h-full shadow-lg">
              <h3 className="text-center font-black text-lg mb-6">
                Ticket Information
              </h3>

              <div className="flex justify-between text-sm font-black mb-4">
                <span>Ticket type</span>
                <span>Quantity</span>
              </div>

              {/* Danh sách ghế đã chọn */}
              {/* Danh sách ghế đã chọn - Đã tối ưu layout */}
              <div className="flex-1 space-y-6 mb-6">
                {selectedSeats.map((seat, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 pb-4 last:border-0"
                  >
                    {/* Hàng 1: Loại vé và Số lượng */}
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-800 uppercase">
                          {/* Nếu có tên Zone thì hiện, không thì để mặc định */}
                          {seat.zone_name && seat.zone_name.length < 20
                            ? seat.zone_name
                            : "VIP"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black">01</span>
                      </div>
                    </div>

                    {/* Hàng 2: Vị trí ghế và Giá tiền */}
                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">
                          Seat
                        </span>
                        <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-[12px] font-black border border-gray-200">
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
                  <span>Subtotal</span>
                  <span className="text-[#8D1B1B] text-xl">
                    {subtotal.toLocaleString()} đ
                  </span>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-[#D39696] text-white font-black py-4 rounded-xl text-lg hover:opacity-90 transition-all uppercase shadow-md"
              >
                Continue
              </button>

              <button
                onClick={() => navigate(-1)}
                className="text-center text-gray-500 text-sm font-bold mt-4 hover:underline"
              >
                Re-select ticket
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
