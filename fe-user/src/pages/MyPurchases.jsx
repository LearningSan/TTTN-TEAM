import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ethers } from "ethers";
import CategoryNav from "../components/CategoryNav";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineArrowRight, HiOutlineTicket, HiOutlineLocationMarker, HiOutlineCalendar } from "react-icons/hi";

const MyPurchases = () => {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        let detectedAccount = "";
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            detectedAccount = accounts[0].toLowerCase();
            setCurrentAccount(detectedAccount);
          }
        }
        await fetchMyPurchases(detectedAccount);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchMyPurchases = async (account) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData.user_id || userData.id;

      const resAllTrans = await axios.get(
        `${import.meta.env.VITE_API_URL}/resale/all-transfers`,
        { withCredentials: true }
      );
      const allTransfers = Array.isArray(resAllTrans.data) ? resAllTrans.data : (resAllTrans.data?.data || []);

      const resTickets = await axios.get(
        `${import.meta.env.VITE_API_URL}/ticket`,
        { 
          params: { status: "TRANSFERRED", pageSize: 100 },
          withCredentials: true 
        }
      );
      const ticketOrders = resTickets.data?.data?.data || [];
      const allMarketTickets = ticketOrders.flatMap(order => 
        (order.tickets || []).map(t => ({
          ...t,
          concert: order.concert,
          venue: order.venue
        }))
      );

      const myPurchases = allTransfers
        .filter(tr => {
          const isMyWallet = account && tr.to_wallet?.toLowerCase() === account;
          const isMyId = userId && String(tr.to_user_id) === String(userId);
          return isMyWallet || isMyId;
        })
        .map(tr => {
          const ticketInfo = allMarketTickets.find(t => t.ticket_id === tr.ticket_id);
          return {
            ...tr,
            ticketInfo: ticketInfo || null
          };
        })
        .filter(p => p.transfer_status === "PENDING");

      setPurchases(myPurchases);
    } catch (err) {
      console.error("Error fetching purchases:", err);
    }
  };

  const handleConfirm = (purchase) => {
    navigate("/payment", {
      state: {
        isResale: true,
        isBuyer: true,
        nftData: purchase,
        concert: purchase.ticketInfo?.concert,
        venue: purchase.ticketInfo?.venue,
        selectedSeats: purchase.ticketInfo?.seat ? [{
          ...purchase.ticketInfo.seat,
          row_name: purchase.ticketInfo.seat.row,
          seat_number: purchase.ticketInfo.seat.number,
          zone_name: purchase.ticketInfo.zone?.zone_name,
          price: purchase.price || 0
        }] : [],
        standingTickets: !purchase.ticketInfo?.seat ? {
          [purchase.ticketInfo?.zone?.zone_id || "resale"]: 1
        } : {},
        amount: purchase.price || 0
      }
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-[#00E5FF]/30">
      <CategoryNav />
      
      <main className="max-w-7xl mx-auto px-6 py-20">
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 bg-gradient-to-r from-[#00E5FF] to-[#FF2D95] bg-clip-text text-transparent">
            Purchasing
          </h1>
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase font-bold">
            Track and complete your NFT ticket transfers
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-16 h-16 border-4 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin shadow-[0_0_20px_rgba(0,229,255,0.3)]" />
            <span className="text-gray-500 font-black tracking-widest uppercase text-xs animate-pulse">Syncing Blockchain Data...</span>
          </div>
        ) : purchases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            <AnimatePresence>
              {purchases.map((p, index) => (
                <motion.div
                  key={p.transfer_id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/20 to-[#FF2D95]/20 blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[40px]" />
                  
                  <div className="relative bg-[#111827] border-2 border-white/5 rounded-[40px] overflow-hidden flex flex-col h-full transition-all duration-500 group-hover:border-[#00E5FF]/50 group-hover:-translate-y-2 shadow-2xl">
                    
                    {/* Header Image */}
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={p.ticketInfo?.concert?.banner_url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"} 
                        alt="Concert" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                      <div className="absolute top-6 left-6">
                        <span className="bg-[#00E5FF]/20 backdrop-blur-md text-[#00E5FF] text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-[#00E5FF]/30 shadow-lg">
                          PENDING TRANSFER
                        </span>
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-2xl font-black mb-6 leading-tight uppercase group-hover:text-[#00E5FF] transition-colors">
                        {p.ticketInfo?.concert?.title || "VE CONCERT"}
                      </h3>

                      <div className="space-y-4 mb-8 text-xs text-gray-400 font-bold tracking-wider">
                        <div className="flex items-center gap-3">
                          <HiOutlineLocationMarker className="text-[#00E5FF]" size={18} />
                          <span className="truncate">{p.ticketInfo?.venue?.name || "Địa điểm chưa cập nhật"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <HiOutlineCalendar className="text-[#FF2D95]" size={18} />
                          <span>{formatDate(p.ticketInfo?.concert?.concert_date)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <HiOutlineTicket className="text-[#00E5FF]" size={18} />
                          <span>
                            NFT ID: <strong className="text-white ml-1">#{p.token_id || "???"}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Detail Box */}
                      <div className="mt-auto bg-black/40 p-5 rounded-3xl border border-white/5 flex justify-between items-center mb-6">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Position</p>
                          <p className="text-sm font-black text-white">
                            {p.ticketInfo?.seat ? `${p.ticketInfo.seat.row}${p.ticketInfo.seat.number}` : `Standing - ${p.ticketInfo?.zone?.zone_name || "N/A"}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Buy Price</p>
                          <p className="text-xl font-black text-[#00E5FF]">
                            {p.price?.toLocaleString()} ETH
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleConfirm(p)}
                        className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00A991] text-black font-black py-4 rounded-2xl uppercase tracking-widest text-[11px] transition-all shadow-[0_10px_20px_rgba(0,229,255,0.2)] hover:shadow-[0_15px_30px_rgba(0,229,255,0.3)] flex items-center justify-center gap-3 active:scale-95 group-hover:brightness-110"
                      >
                        Xác nhận & Nhận vé
                        <HiOutlineArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-32 bg-[#111827] rounded-[40px] border-2 border-dashed border-white/10 max-w-2xl mx-auto shadow-2xl">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <HiOutlineTicket className="text-gray-600" size={48} />
            </div>
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Empty Purchases</h2>
            <p className="text-gray-500 text-sm mb-10 tracking-widest uppercase max-w-xs mx-auto font-bold leading-relaxed">
              You don't have any tickets waiting for confirmation.
            </p>
            <Link
              to="/resale-market"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#00E5FF] to-[#00A991] text-black px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#00E5FF]/20 hover:brightness-110 transition-all active:scale-95"
            >
              Marketplace
              <HiOutlineArrowRight size={16} />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyPurchases;
