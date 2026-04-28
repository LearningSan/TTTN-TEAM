import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import { IoShieldCheckmarkSharp } from "react-icons/io5";

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 font-bold">
          Không tìm thấy thông tin giao dịch!
        </p>
        <button
          onClick={() => navigate("/my-tickets")}
          className="mt-4 text-blue-500 underline"
        >
          Quay lại trang vé của tôi
        </button>
      </div>
    );
  }

  const isResale = state?.isResale;
  const nftData = state?.nftData;
  const amountVND = state?.amount || 0;
  const paymentId = state?.paymentId || state?.payment_id;

  const ethAmount = (amountVND / 60000000).toFixed(6);
  const NFT_ABI = [
    "function transferFrom(address from, address to, uint256 tokenId) public",
    "function approve(address to, uint256 tokenId) public",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function ownerOf(uint256 tokenId) view returns (address)",
  ];

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          setCurrentAccount((await signer.getAddress()).toLowerCase());
        } catch (error) {
          console.error("Lỗi kết nối ví:", error);
        }
      }
    };
    checkWallet();
  }, []);

  const isSeller =
    currentAccount && nftData?.from_wallet?.toLowerCase() === currentAccount;
  const isBuyer =
    currentAccount && nftData?.to_wallet?.toLowerCase() === currentAccount;

  const handleResaleFlow = async () => {
    if (!nftData) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        nftData.contract_address,
        NFT_ABI,
        signer,
      );

      if (isSeller) {
        console.log("🔌 Seller approving...");
        const owner = await contract.ownerOf(nftData.token_id);
        if (owner.toLowerCase() !== currentAccount.toLowerCase()) {
          throw new Error("Bạn không sở hữu NFT này trên Blockchain!");
        }

        const tx = await contract.approve(nftData.to_wallet, nftData.token_id);
        await tx.wait();

        const approved = await contract.getApproved(nftData.token_id);
        alert(`✅ Đã cấp quyền cho người mua: ${approved}`);
        window.location.reload();
      } else if (isBuyer) {
        const approved = await contract.getApproved(nftData.token_id);

        if (approved.toLowerCase() !== currentAccount.toLowerCase()) {
          alert(
            "Người bán chưa xác thực quyền (Approve). Vui lòng đợi người bán bấm xác nhận.",
          );
          setLoading(false);
          return;
        }

        console.log("🚀 Chuyển nhượng NFT...");
        const tx = await contract.transferFrom(
          nftData.from_wallet,
          nftData.to_wallet,
          nftData.token_id,
        );
        await tx.wait();

        await axios.post(
          `${import.meta.env.VITE_API_URL}/resale/confirm`,
          {
            transfer_id: nftData.transfer_id,
            tx_hash: tx.hash,
          },
          { withCredentials: true },
        );

        alert("🎉 Chuyển nhượng hoàn tất! Bạn đã là chủ sở hữu mới.");
        navigate("/my-tickets");
      }
    } catch (error) {
      alert("Lỗi: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  }; // <--- ĐÃ THÊM DẤU ĐÓNG HÀM handleResaleFlow

  const handlePrimaryPayment = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài đặt MetaMask!");
      return;
    }

    const paymentId = state?.paymentId || state?.payment_id;
    if (!paymentId) {
      alert("Không tìm thấy thông tin định danh giao dịch!");
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const currentAddress = (await signer.getAddress()).toLowerCase();

      if (!isResale) {
        const amountInWei = ethers.parseEther(ethAmount.toString()).toString();

        const checkRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/check-balance`,
          { from_wallet: currentAddress, amount: amountInWei },
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
            {
              payment_id: paymentId,
              tx_hash: tx.hash,
            },
            { withCredentials: true },
          );

          if (confirmRes.data?.success) {
            alert("Thanh toán thành công! Hệ thống đang khởi tạo vé.");
            const finalOrderId = state?.orderId?.order_id || state?.orderId;
            navigate(`/order-success/${finalOrderId}`);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi quy trình thanh toán:", error);
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-md w-full bg-white border-[3px] border-[#8D1B1B] rounded-[40px] p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-center text-gray-800 mb-6 uppercase italic">
          {isResale ? "Resale Confirmation" : "Payment Method"}
        </h2>

        <div className="bg-red-50 rounded-2xl p-6 mb-6 border border-red-100">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 font-bold">Mã GD:</span>
            <span className="font-black text-red-700">
              #{nftData?.transfer_id || paymentId || "N/A"}
            </span>
          </div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-500 font-bold">Token ID:</span>
            <span className="font-bold italic">
              #{nftData?.token_id || "N/A"}
            </span>
          </div>
          <div className="border-t border-red-200 pt-2 mt-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              Ví hiện tại:
            </p>
            <p className="text-[10px] font-mono truncate">{currentAccount}</p>
          </div>
        </div>

        {isResale ? (
          <>
            {isSeller ? (
              <button
                onClick={handleResaleFlow}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl"
              >
                {loading ? "Đang xử lý..." : "Xác nhận bán (Approve)"}
              </button>
            ) : isBuyer ? (
              <button
                onClick={handleResaleFlow}
                disabled={loading}
                className="w-full bg-[#8D1B1B] hover:bg-black text-white font-black py-4 rounded-2xl"
              >
                {loading ? "Đang xử lý..." : "Hoàn tất mua vé (Transfer)"}
              </button>
            ) : (
              <div className="text-center p-4 border-2 border-dashed border-red-200 rounded-2xl text-red-500 text-xs">
                Vui lòng kết nối đúng ví giao dịch: <br />{" "}
                {nftData?.from_wallet || nftData?.to_wallet}
              </div>
            )}
          </>
        ) : (
          <button
            onClick={handlePrimaryPayment}
            disabled={loading}
            className="w-full bg-black text-white font-black py-4 rounded-2xl"
          >
            {loading ? "Processing..." : "Pay with MetaMask"}
          </button>
        )}
      </div>
    </div>
  );
}; // <--- ĐÃ THÊM DẤU ĐÓNG COMPONENT Payment

export default Payment;
