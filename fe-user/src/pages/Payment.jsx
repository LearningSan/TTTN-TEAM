import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { FaWallet } from "react-icons/fa";

const Payment = () => {
  const { state } = useLocation();
  console.log("Dữ liệu nhận tại Payment:", state);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const orderId = state?.orderId;
  const paymentIdActual = state?.paymentId || state?.payment_id;
  const amountVND = state?.amount || 0;
  const ethAmount = (amountVND / 60000000).toFixed(6);

  const handleMetaMaskPayment = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài đặt MetaMask!");
      return;
    }

    // Phân biệt ID: Mua mới dùng paymentIdActual, Resale dùng transferId từ state
    const isResale = state?.isResale;
    const idToConfirm = isResale ? state?.transferId : paymentIdActual;

    if (!idToConfirm) {
      alert("Không tìm thấy thông tin định danh giao dịch!");
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // ================= BƯỚC 1: KIỂM TRA MẠNG SEPOLIA =================
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== 11155111) {
        alert("Vui lòng chuyển sang mạng Sepolia Testnet!");
        setLoading(false);
        return;
      }

      let txHash = "";

      if (isResale) {
        // ================= NHÁNH A: GIAO DỊCH RESALE (NFT TRANSFER) =================
        const { nftData } = state; // Nhận dữ liệu NFT từ ResaleMarket truyền sang
        // KIỂM TRA SỐ DƯ ETH TRONG VÍ NGƯỜI MUA (Đảm bảo đủ để trả phí Gas)
        const balance = await provider.getBalance(address);

        // Ước tính phí gas cho giao dịch transfer (ví dụ: 0.002 ETH trên Sepolia)
        // Bạn có thể dùng provider.getFeeData() để chính xác hơn hoặc set cứng 1 khoảng an toàn
        const estimatedGas = ethers.parseEther("0.005");

        if (balance < estimatedGas) {
          alert(
            "Ví của bạn không đủ ETH để trả phí Gas cho giao dịch chuyển vé!",
          );
          setLoading(false);
          return;
        }
        // Khởi tạo Contract NFT
        const ticketContract = new ethers.Contract(
          nftData.contract_address,
          [
            "function transferFrom(address from, address to, uint256 tokenId) public",
          ],
          signer,
        );

        // Thực hiện chuyển NFT từ người bán (seller) sang người mua (người dùng hiện tại)
        const tx = await ticketContract.transferFrom(
          nftData.seller_address,
          address,
          nftData.token_id,
        );

        console.log("Đang chờ xác nhận chuyển NFT:", tx.hash);
        const receipt = await tx.wait(); // Đợi giao dịch SUCCESS (status = 1)

        if (receipt.status !== 1)
          throw new Error("Giao dịch chuyển NFT thất bại trên Blockchain!");
        txHash = tx.hash;

        // XÁC NHẬN VỚI BACKEND QUA API /resale/confirm
        const confirmRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/resale/confirm`,
          {
            transfer_id: idToConfirm,
            tx_hash: txHash,
          },
          { withCredentials: true },
        );

        if (confirmRes.data?.success) {
          alert("Mua vé sang nhượng thành công!");
          navigate("/my-tickets"); // Chuyển về danh sách vé cá nhân
        }
      } else {
        // ================= NHÁNH B: GIAO DỊCH MUA MỚI (ETH TRANSFER) =================
        // (Giữ nguyên logic cũ của bạn)
        const amountInWei = ethers.parseEther(ethAmount.toString()).toString();

        const checkRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/check-balance`,
          { from_wallet: address, amount: amountInWei },
          { withCredentials: true },
        );

        if (!checkRes.data?.has_enough_balance) {
          alert("Ví của bạn không đủ số dư ETH!");
          setLoading(false);
          return;
        }

        const systemWallet = import.meta.env.VITE_WALLET_ADDRESS;
        const tx = await signer.sendTransaction({
          to: systemWallet,
          value: ethers.parseEther(ethAmount.toString()),
        });

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          const confirmRes = await axios.post(
            `${import.meta.env.VITE_API_URL}/confirm-payment`,
            { payment_id: idToConfirm, tx_hash: tx.hash },
            { withCredentials: true },
          );

          if (confirmRes.data?.success) {
            alert("Thanh toán thành công! Hệ thống đang khởi tạo vé.");
            navigate(`/order-success/${orderId.order_id}`);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi quy trình:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert("Lỗi: " + errorMsg);
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
