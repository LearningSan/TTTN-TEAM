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

  const concert = state?.concert;
  const selectedSeats = state?.selectedSeats || [];
  const standingTickets = state?.standingTickets || {};
  const zones = state?.zones || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "Đang cập nhật";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-12 font-sans tracking-wide">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">

          <h1 className="text-4xl md:text-5xl text-white uppercase tracking-[0.2em] mb-2 font-black">
             Payment
          </h1>
          <p className="text-gray-400 tracking-widest text-xs uppercase">
            {isResale ? "NFT Ticket Resale" : "Official Ticket Booking"}
          </p>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-[#00E5FF]/20 blur-[30px] pointer-events-none rounded-[30px]" />
          
          <div className="relative border-2 border-[#00E5FF] rounded-[30px] p-8 md:p-10 bg-[#111827] shadow-[0_0_50px_rgba(0,229,255,0.15)] z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF2D95]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
            
            <div className="relative z-20 border-b border-gray-700 pb-8 mb-8">
              <h2 className="text-[#00E5FF] text-3xl mb-4 leading-tight uppercase tracking-wider font-bold">
                {concert?.title || "Tên sự kiện"}
              </h2>
              <div className="flex flex-col gap-3 text-sm text-gray-300">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#FF2D95]" />
                  <span>{formatDate(concert?.concert_date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                  <span>{concert?.venue_name || concert?.venue?.name || "Địa điểm chưa cập nhật"}</span>
                </div>
              </div>
            </div>

            <div className="relative z-20 space-y-6 mb-8">
              <h3 className="text-[#FF2D95] text-lg uppercase tracking-widest border-l-4 border-[#FF2D95] pl-4 mb-6 font-bold">
                Ticket Details
              </h3>
              
              <div className="space-y-4">
                {selectedSeats.map((seat, index) => (
                  <div key={`seat-${index}`} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-gray-800">
                    <div>
                      <p className="text-[#00E5FF] font-bold text-sm uppercase">{seat.zone_name}</p>
                      <p className="text-gray-400 text-xs">Hàng {seat.row_name} - Ghế {seat.seat_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{seat.price?.toLocaleString()} đ</p>
                    </div>
                  </div>
                ))}

                {Object.entries(standingTickets).map(([zoneId, qty]) => {
                  if (qty <= 0) return null;
                  const zone = zones?.find(z => String(z.zone_id) === String(zoneId));
                  const price = zone?.price || 0;
                  return (
                    <div key={`standing-${zoneId}`} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-gray-800">
                      <div>
                        <p className="text-[#00E5FF] font-bold text-sm uppercase">{zone?.name || "Khu vực đứng"}</p>
                        <p className="text-gray-400 text-xs">Số lượng: {qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{(price * qty).toLocaleString()} đ</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative z-20 bg-black/60 rounded-[20px] p-6 border border-[#FF2D95]/30">
              <div className="flex justify-between items-center mb-4 text-gray-400 text-xs uppercase tracking-[0.2em]">
                <span>Transaction ID</span>
                <span className="font-mono">#{nftData?.transfer_id || paymentId || "PENDING"}</span>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-3xl text-[#FF2D95] font-bold">{amountVND.toLocaleString()} đ</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Crypto Equivalent</p>
                  <p className="text-xl text-[#00E5FF] font-bold">{ethAmount} ETH</p>
                </div>
              </div>
            </div>

            <div className="mt-10 relative z-20">
              {isResale ? (
                <>
                  {isSeller ? (
                    <button
                      onClick={handleResaleFlow}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00A991] hover:opacity-90 text-black font-black py-5 rounded-2xl uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Approve Sale (Step 1)"}
                    </button>
                  ) : isBuyer ? (
                    <button
                      onClick={handleResaleFlow}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#FF2D95] to-[#FF69B4] hover:opacity-90 text-white font-black py-5 rounded-2xl uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Complete Purchase (Step 2)"}
                    </button>
                  ) : (
                    <div className="text-center p-6 bg-red-950/20 border border-red-900/50 rounded-2xl text-red-400 text-xs">
                      <p className="mb-2 uppercase font-black tracking-widest">Wrong Wallet Detected</p>
                      Please connect: <br />
                      <span className="font-mono text-gray-300 select-all">{nftData?.from_wallet || nftData?.to_wallet}</span>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={handlePrimaryPayment}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#FF2D95] to-[#00E5FF] hover:opacity-90 text-white font-black py-5 rounded-2xl uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_30px_rgba(0,229,255,0.3)]"
                >
                  {loading ? "Initializing..." : "Complete Order with MetaMask"}
                </button>
              )}
              
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-[10px] uppercase tracking-widest">
                <IoShieldCheckmarkSharp className="text-[#00E5FF]" />
                Protected by Ethereum Smart Contract
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
