import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiCheckCircle, HiOutlineTicket, HiOutlineHome } from "react-icons/hi";

const OrderSuccess = () => {
  const { orderId } = useParams(); // Lấy mã đơn hàng từ URL
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#1A1A1A] rounded-[40px] p-10 shadow-2xl border border-gray-800 text-center">
        {/* Icon thành công */}
        <div className="flex justify-center mb-6">
          <HiCheckCircle className="text-green-500" size={80} />
        </div>

        <h1 className="text-3xl font-black italic uppercase mb-2">Success!</h1>
        <p className="text-gray-400 mb-8">
          Chúc mừng! Đơn hàng của bạn đã được hệ thống ghi nhận thành công.
        </p>

        {/* Box mã đơn hàng */}
        <div className="bg-black rounded-2xl p-6 mb-8 border border-dashed border-gray-700">
          <p className="text-xs text-gray-500 uppercase font-bold mb-2">
            Order ID
          </p>
          <code className="text-green-400 font-mono break-all text-sm">
            {orderId}
          </code>
        </div>

        {/* Nút bấm điều hướng */}
        <div className="space-y-4">
          <button
            onClick={() => navigate("/my-tickets")}
            className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-500 hover:text-white transition-all uppercase"
          >
            <HiOutlineTicket size={20} /> Xem vé của tôi
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-transparent text-gray-500 font-bold py-2 flex items-center justify-center gap-2 hover:text-white transition-all"
          >
            <HiOutlineHome size={18} /> Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
