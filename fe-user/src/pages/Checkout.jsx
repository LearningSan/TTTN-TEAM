import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineLocationMarker, HiOutlineCalendar } from "react-icons/hi";
import { AiFillHome } from "react-icons/ai";
import { GiTicket } from "react-icons/gi";

const Checkout = () => {
  const { state } = useLocation(); // Nhận dữ liệu concert và selectedSeats từ trang trước
  const navigate = useNavigate();
  const orderId = state?.orderId;

  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // Dữ liệu mẫu nếu state trống (Dinh hãy truyền data thật từ SeatSelection qua nhé)
  const concert = state?.concert || {
    title: 'ANH TRAI "SAY HI" CONCERT - DAY 2',
    location: "Khu Đô Thị Vạn Phúc City, Thủ Đức, TP. HCM",
    date: "12:00 - 23:00, 18 tháng 04, 2026",
  };
  const selectedSeats = state?.selectedSeats || [
    { seat_label: "H-12", zone_name: "VIP", price: 2900000 },
  ];

  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const handleContinue = () => {
    if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    // Chuyển sang trang thanh toán hoặc thông báo thành công
    navigate(`/order-success/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      {/* Header đồng bộ */}
      <header className="bg-white py-4 px-12 flex items-center justify-between border-b border-gray-100">
        <h1 className="text-3xl font-black tracking-tighter text-[#8D1B1B]">
          TICKETX
        </h1>
        <div className="flex items-center gap-6 text-[13px] font-bold text-gray-700 uppercase">
          <button className="border border-gray-400 px-4 py-1 rounded">
            Create Event
          </button>
          <span className="flex items-center gap-1">
            <GiTicket size={18} /> My ticket
          </span>
          <span>Sign in</span>
        </div>
      </header>

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
            <div className="bg-white rounded-[30px] p-8 space-y-6">
              <div className="bg-gray-400 text-black font-black py-3 px-8 rounded-full inline-block mb-4">
                Ticket Type
              </div>

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
                    placeholder="deniel123@gmail.com"
                    className="w-full border-2 border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none"
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                  />
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
              <div className="flex-1 space-y-4 mb-6">
                {selectedSeats.map((seat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-gray-500 font-bold">{seat.zone_name}</p>
                    <div className="flex justify-between font-black text-sm mt-1">
                      <span>{seat.price.toLocaleString()} đ</span>
                      <span>01</span>
                    </div>
                    <p className="text-gray-500 font-bold mt-1">
                      {seat.seat_label}
                    </p>
                    <p className="text-right font-black text-sm">
                      {seat.price.toLocaleString()} đ
                    </p>
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
