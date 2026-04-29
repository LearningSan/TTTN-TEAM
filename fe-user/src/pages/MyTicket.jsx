import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineTicket,
  HiOutlineDotsHorizontal,
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import CategoryNav from "../components/CategoryNav";

const MyTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        setLoading(true);
        const resUser = await axios.get(
          `${import.meta.env.VITE_API_URL}/ticket/user`,
          {
            params: { page: 1, pageSize: 50 },
            withCredentials: true,
          },
        );

        const resTransfers = await axios.get(
          `${import.meta.env.VITE_API_URL}/resale/my-transfers`,
          {
            withCredentials: true,
          },
        );

        const myOrders = resUser.data?.data?.data || [];
        const pendingTransfers = resTransfers.data || [];

        const combinedTickets = myOrders.flatMap((order) =>
          (order.tickets || []).map((t) => {
            const transferData = pendingTransfers.find(
              (tr) => tr.ticket_id === t.ticket_id,
            );
            
            // Tìm tên khu vực từ thông tin concert nếu t.zone_name không có
            const zoneFromConcert = order.concert?.zones?.find(
              (z) => String(z.zone_id) === String(t.zone_id)
            );

            return {
              ...t,
              zone_name: t.zone_name || zoneFromConcert?.name,
              concert_info: order.concert,
              venue_info: order.venue,
              resale_transfer: transferData,
            };
          }),
        );

        setTickets(combinedTickets);
      } catch (error) {
        console.error("Lỗi fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTickets();
  }, [navigate]);

  const handleListResale = async (ticket_id) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/resale/list`,
        { ticket_id: ticket_id },
        { withCredentials: true },
      );

      if (response.data) {
        alert("Đã đẩy vé lên sàn thành công!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Lỗi đẩy vé lên sàn:", error);
      alert("Lỗi: " + (error.response?.data?.message || "Không thể đẩy vé lên sàn"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelResale = async (ticketId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu chuyển nhượng và thu hồi vé này không?"))
      return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/resale/cancel`,
        { ticket_id: ticketId },
        { withCredentials: true },
      );

      if (response.data) {
        alert("Đã hủy và thu hồi vé về ví của bạn thành công!");
        window.location.reload();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      if (errorMsg === "Cannot cancel: ticket already in transfer") {
        alert("Không thể hủy vì vé đã có người mua và đang trong quá trình chuyển nhượng!");
      } else {
        alert("Lỗi khi hủy pass vé: " + errorMsg);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Đang cập nhật";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-anton tracking-wide">
      <CategoryNav />
      <div className="p-6 md:p-12">
        <main className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl text-white uppercase tracking-wider mb-2">
              My Ticket
            </h1>
           
          </div>
          <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent mx-10 mb-4" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
            <p className="font-sans text-gray-400 text-xs uppercase tracking-widest">Loading...</p>
          </div>
        ) : tickets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatePresence>
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.ticket_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity rounded-[30px] ${ticket.status === 'ACTIVE' ? 'bg-[#00E5FF]' : 'bg-[#FF2D95]'}`} />
                  
                  <div className={`relative bg-[#111827] border-2 rounded-[30px] overflow-hidden flex flex-col h-full transition-all duration-300 group-hover:-translate-y-1 ${ticket.status === 'ACTIVE' ? 'border-[#00E5FF]/40 group-hover:border-[#00E5FF]' : 'border-[#FF2D95]/40 group-hover:border-[#FF2D95]'}`}>
                    
                    <div className="p-6 md:p-8 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${ticket.status === 'ACTIVE' ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30' : 'bg-[#FF2D95]/10 text-[#FF2D95] border border-[#FF2D95]/30'}`}>
                          {ticket.status}
                        </span>
                       
                      </div>

                      <h3 className="text-2xl md:text-3xl mb-4 leading-tight">
                        {ticket.concert_info?.title || "VE CONCERT"}
                      </h3>

                      <div className="font-sans space-y-3 mb-8 text-xs text-gray-400 font-medium">
                        <div className="flex items-center gap-3">
                          <HiOutlineLocationMarker className={ticket.status === 'ACTIVE' ? "text-[#00E5FF]" : "text-[#FF2D95]"} size={16} />
                          <span>{ticket.venue_info?.name || "Địa điểm chưa cập nhật"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <HiOutlineCalendar className={ticket.status === 'ACTIVE' ? "text-[#00E5FF]" : "text-[#FF2D95]"} size={16} />
                          <span>{formatDate(ticket.concert_info?.concert_date)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <HiOutlineTicket className={ticket.status === 'ACTIVE' ? "text-[#00E5FF]" : "text-[#FF2D95]"} size={16} />
                          <span>
                            Ticket: <strong className="text-white ml-1">
                              {(!ticket.seat || 
                                (ticket.tier?.name || ticket.zone?.zone_name || ticket.zone_name || "").toLowerCase() === "dung" || 
                                (ticket.tier?.name || ticket.zone?.zone_name || ticket.zone_name || "").toLowerCase() === "đứng") 
                                ? `Standing - ${ticket.zone?.zone_name || ticket.zone_name || "Khu vực đứng"}` 
                                : `${ticket.tier?.name || ticket.zone?.zone_name || ticket.zone_name || "General"} - ${ticket.seat?.label || ""}`}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                        <div className="w-20 h-20 bg-white p-2 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                          <img src={ticket.qr_url} alt="QR" className="w-full h-full object-contain" />
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Value</p>
                          <p className={`text-xl ${ticket.status === 'ACTIVE' ? 'text-[#00E5FF]' : 'text-[#FF2D95]'}`}>
                            {ticket.price?.unit_price ? `${ticket.price.unit_price.toLocaleString()} đ` : "0 đ"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/5 bg-white/[0.02] p-4 flex gap-3">
                      {ticket.status === "TRANSFERRED" && (
                        <div className="flex w-full gap-3">
                          {ticket.resale_transfer ? (
                            <button
                              onClick={() => navigate("/payment", {
                                state: { 
                                  isResale: true, 
                                  nftData: ticket.resale_transfer, 
                                  amount: 0,
                                  concert: {
                                    ...ticket.concert_info,
                                    venue_name: ticket.venue_info?.name
                                  },
                                  selectedSeats: ticket.seat ? [{
                                    ...ticket.seat,
                                    row_name: ticket.seat.row,
                                    seat_number: ticket.seat.number,
                                    zone_name: ticket.zone?.zone_name || ticket.zone_name,
                                    price: 0
                                  }] : [],
                                  standingTickets: !ticket.seat ? {
                                    [ticket.zone?.zone_id || "resale"]: 1
                                  } : {},
                                  zones: [ticket.zone || { name: ticket.zone_name, price: 0 }]
                                }
                              })}
                              className="flex-[7] bg-gradient-to-r from-[#00E5FF] to-[#00A991] text-black text-[11px] font-black py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-[#00E5FF]/20 hover:brightness-110 transition-all"
                            >
                              Xác Nhận Bán
                            </button>
                          ) : (
                            <div className="flex-[7] flex items-center justify-center bg-gray-800/50 rounded-xl py-4 px-4 border border-white/5">
                              <span className="text-[10px] text-orange-400 font-bold uppercase italic animate-pulse">Waiting...</span>
                            </div>
                          )}
                          <button
                            onClick={() => handleCancelResale(ticket.ticket_id)}
                            className="flex-[3] py-4 bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] font-black rounded-xl uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
                          >
                            Hủy Vé
                          </button>
                        </div>
                      )}

                      {ticket.status === "ACTIVE" && (
                        <button
                          onClick={() => handleListResale(ticket.ticket_id)}
                          className="w-full bg-white/5 hover:bg-[#00E5FF] hover:text-black text-white text-[11px] font-black py-3 rounded-xl uppercase tracking-widest border border-white/10 hover:border-[#00E5FF] transition-all"
                        >
                          Pass vé
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-32 bg-[#111827] rounded-[40px] border-2 border-dashed border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineTicket className="text-gray-600" size={40} />
            </div>
            <h3 className="text-2xl mb-2 uppercase">Empty Collection</h3>
            <p className="font-sans text-gray-400 text-sm mb-8 tracking-widest uppercase">
              You haven't purchased any tickets yet.
            </p>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-[#00E5FF] to-[#00A991] text-black px-10 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#00E5FF]/20 hover:brightness-110 transition-all"
            >
              Explore Events
            </Link>
          </div>
        )}
      </main>

    
      </div>
    </div>
  );
};

export default MyTicket;
