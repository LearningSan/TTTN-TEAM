import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { FaWallet } from "react-icons/fa";

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const orderId = state?.orderId;
  const paymentIdActual = state?.paymentId; // Đây là UUID từ DB
  const amountVND = state?.amount || 0;
  const ethAmount = (amountVND / 60000000).toFixed(6);

  const handleMetaMaskPayment = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài đặt MetaMask!");
      return;
    }

    if (!paymentIdActual) {
      alert(
        "Lỗi: Không tìm thấy ID thanh toán. Vui lòng thực hiện lại từ đầu!",
      );
      return;
    }

    setLoading(true);
    try {
      // BƯỚC 1: THỰC HIỆN CHUYỂN TIỀN TRÊN BLOCKCHAIN
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: import.meta.env.VITE_WALLET_ADDRESS,
        value: ethers.parseEther(ethAmount),
      });

      console.log("Đang chờ xác nhận giao dịch...");
      await tx.wait(); // Đợi ví trừ tiền thành công

      // BƯỚC 2: GỌI API XÁC NHẬN ĐỂ LƯU VÉ VÀO DB
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/confirm-payment`,
          { payment_id: paymentIdActual },
          { withCredentials: true },
        );

        if (response.data?.success) {
          alert("Thanh toán và lưu vé thành công!");
          navigate(`/order-success/${orderId}`);
        } else {
          // Trường hợp API trả về success: false
          throw new Error("Backend không thể xác nhận thanh toán.");
        }
      } catch (apiError) {
        console.error(
          "Lỗi lưu vào DB:",
          apiError.response?.data?.message || apiError.message,
        );
        alert(
          "Tiền đã trừ thành công nhưng hệ thống gặp lỗi khi tạo vé. Vui lòng chụp màn hình giao dịch và liên hệ Admin!",
        );
        // Vẫn cho sang trang thành công nếu bạn muốn Demo lướt qua lỗi DB
        navigate(`/order-success/${orderId}`);
      }
    } catch (error) {
      console.error("Lỗi giao dịch MetaMask:", error);
      alert("Giao dịch bị hủy hoặc ví không đủ tiền!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-md w-full bg-white border-[3px] border-[#31A1EE] rounded-[40px] p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-center text-gray-800 mb-6 uppercase">
          Payment Method
        </h2>

        <div className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-100">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 font-bold">Order ID:</span>
            <span className="font-black text-blue-600">#{orderId}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 font-bold">Total (VND):</span>
            <span className="font-black text-gray-800">
              {amountVND.toLocaleString()} đ
            </span>
          </div>
          <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
            <span className="text-gray-700 font-black">Crypto Amount:</span>
            <span className="font-black text-[#8D1B1B] text-lg">
              {ethAmount} ETH
            </span>
          </div>
        </div>

        <button
          onClick={handleMetaMaskPayment}
          disabled={loading}
          className="w-full bg-[#F6851B] hover:bg-[#E2761B] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <FaWallet size={24} /> Pay with MetaMask
            </>
          )}
        </button>
        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs font-bold">
          <IoShieldCheckmarkSharp size={16} />
          <span>Secure Blockchain Transaction</span>
        </div>
      </div>
    </div>
  );
};

export default Payment;
