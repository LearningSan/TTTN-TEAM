import React from "react";
import { useNavigate, useLocation, useSearchParams, useParams } from "react-router-dom";
import { HiCheckCircle, HiOutlineTicket, HiOutlineHome } from "react-icons/hi";
import { motion } from "framer-motion";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: paramOrderId } = useParams();
  const [searchParams] = useSearchParams();

  // Lấy mã đơn hàng từ URL params, query string hoặc state
  const orderId =
    paramOrderId ||
    searchParams.get("order_id") ||
    location.state?.orderId ||
    "N/A";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6 font-anton tracking-wide">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative group"
      >
        {/* Neon Glow effect */}
        <div className="absolute inset-0 bg-[#00E5FF]/20 blur-[40px] pointer-events-none rounded-[40px]" />
        
        <div className="relative bg-[#111827] border-2 border-[#00E5FF] rounded-[40px] p-10 shadow-[0_0_50px_rgba(0,229,255,0.2)] text-center overflow-hidden">
          {/* Abstract background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF2D95]/10 rounded-full blur-[60px]" />
          
          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-8"
            >
              <div className="p-5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                <HiCheckCircle className="text-[#00E5FF] text-7xl" />
              </div>
            </motion.div>

            <h1 className="text-5xl text-white uppercase tracking-[0.1em] mb-4">
              Success!
            </h1>
            
            <p className="font-sans text-gray-400 text-sm leading-relaxed mb-10 tracking-widest uppercase">
              Chúc mừng! Đơn hàng của bạn đã được ghi nhận. <br/>
            </p>

            <div className="bg-black/60 rounded-3xl p-6 mb-10 border border-[#FF2D95]/30 group-hover:border-[#FF2D95]/60 transition-colors">
              <p className="font-sans text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] mb-3">
                Order Reference
              </p>
              <code className="text-[#FF2D95] font-mono break-all text-xs lg:text-sm">
                #{orderId}
              </code>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate("/my-tickets")}
                className="w-full bg-gradient-to-r from-[#FF2D95] to-[#00E5FF] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 transition-all uppercase tracking-widest shadow-[0_10px_20px_rgba(255,45,149,0.3)] active:scale-95"
              >
                <HiOutlineTicket size={24} /> 
                <span>Xem vé của tôi</span>
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full bg-transparent text-gray-500 font-sans text-xs font-black py-2 hover:text-[#00E5FF] transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                <HiOutlineHome size={18} /> 
                Quay lại trang chủ
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
