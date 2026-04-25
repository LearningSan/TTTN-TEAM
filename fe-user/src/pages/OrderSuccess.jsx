import React from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"; // Thêm useSearchParams
import { HiCheckCircle, HiOutlineTicket, HiOutlineHome } from "react-icons/hi";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams(); // Hook để lấy query string (?order_id=...)

  // Kiểm tra lần lượt các nguồn để lấy mã đơn hàng
  const orderId =
    searchParams.get("order_id") || // 1. Lấy từ ?order_id=...
    location.state?.orderId || // 2. Lấy từ state truyền qua navigate
    "N/A"; // 3. Mặc định

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#1A1A1A] rounded-[40px] p-10 shadow-2xl border border-gray-800 text-center">
        <div className="flex justify-center mb-6">
          <HiCheckCircle className="text-green-500" size={80} />
        </div>

        <h1 className="text-3xl font-black italic uppercase mb-2">Success!</h1>
        <p className="text-gray-400 mb-8">
          Chúc mừng! Đơn hàng của bạn đã được hệ thống ghi nhận thành công.
        </p>

        <div className="bg-black rounded-2xl p-6 mb-8 border border-dashed border-gray-700">
          <p className="text-xs text-gray-500 uppercase font-bold mb-2">
            Order ID
          </p>
          <code className="text-green-400 font-mono break-all text-sm">
            {orderId}
          </code>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/my-tickets")}
            className="w-full bg-green-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-600 transition-all uppercase shadow-lg shadow-green-500/20"
          >
            <HiOutlineTicket size={20} /> Xem vé của tôi
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-transparent text-gray-400 font-bold py-2 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <HiOutlineHome size={18} /> Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
