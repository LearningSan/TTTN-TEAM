import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineTicket,
} from "react-icons/hi";
import { FaEthereum } from "react-icons/fa";
import { ethers } from "ethers";

const ResaleMarket = () => {
  const [resaleTickets, setResaleTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); // State riêng cho việc bấm nút mua
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResaleTickets = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/ticket`,
          {
            params: {
              status: "TRANSFERRED",
              page: 1,
              pageSize: 10,
            },
            withCredentials: true,
            timeout: 60000,
          },
        );

        const orders = response.data?.data?.data || [];

        if (Array.isArray(orders)) {
          const flattenedTickets = orders.flatMap((orderItem) =>
            (orderItem.tickets || []).map((t) => ({
              ...t,
              concert: orderItem.concert,
              venue: orderItem.venue,
              order_id: orderItem.order_id,
            })),
          );
          setResaleTickets(flattenedTickets);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách resale:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResaleTickets();
  }, []);

  // Trong ResaleMarket.jsx, hàm handleBuy
  const handleBuy = async (ticketId, price) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/resale/buy`,
        { ticket_id: ticketId },
        { withCredentials: true },
      );

      // Chuyển hướng người mua sang Payment
      navigate("/payment", {
        state: {
          isResale: true,
          nftData: res.data, // Chứa transfer_id, from_wallet, to_wallet, token_id...
          amount: price,
        },
      });
    } catch (err) {
      alert("Lỗi mua vé: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#11131A] text-white font-sans selection:bg-pink-500/30">
      {/* Nav Section */}
      <nav className="bg-[#0A0A0A] py-6 border-b border-gray-900 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-start gap-12 text-[18px] font-[900] uppercase tracking-tighter px-12 items-end">
          {[
            {
              name: "Theatre & Arts",
              color: "bg-[#FF2D95]",
              shadow: "shadow-[0_0_10px_#FF2D95]",
              path: "/",
              isLink: true,
            },
            {
              name: "Sports",
              color: "bg-[#00E5FF]",
              shadow: "shadow-[0_0_10px_#00E5FF]",
              path: "#",
            },
            {
              name: "Seminars & Workshops",
              color: "bg-[#FF2D95]",
              shadow: "shadow-[0_0_10px_#FF2D95]",
              path: "#",
            },
            {
              name: "Resale Ticket",
              color: "bg-[#00E5FF]",
              shadow: "shadow-[0_0_10px_#00E5FF]",
              path: "/resale-market",
              isLink: true,
            },
          ].map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center group cursor-pointer"
            >
              {item.isLink ? (
                <Link
                  to={item.path}
                  className={`transition-colors duration-200 ${item.name === "Resale Ticket" ? "text-[#00E5FF]" : "text-white hover:text-[#00E5FF]"}`}
                >
                  {item.name}
                </Link>
              ) : (
                <a
                  href={item.path}
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  {item.name}
                </a>
              )}

              {/* Thanh line neon phía dưới giữ nguyên để đồng bộ giao diện */}
              <div
                className={`h-[3px] w-full mt-2 ${item.color} ${item.shadow} transition-transform duration-300 group-hover:scale-x-110`}
              ></div>
            </div>
          ))}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-black uppercase text-center mb-16 tracking-widest text-white drop-shadow-md">
          Resale Ticket List
        </h1>

        {loading ? (
          <div className="text-center py-20 font-bold text-gray-400 animate-pulse">
            Đang tải danh sách vé...
          </div>
        ) : resaleTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {resaleTickets.map((ticket) => {
              const isVIP = ticket.zone?.zone_name?.toLowerCase().includes("vip");
              const themeColor = isVIP ? "#F06292" : "#4DD0E1"; // Pink for VIP, Cyan for Standard
              const glowShadow = isVIP 
                ? "0 10px 25px -5px rgba(240, 98, 146, 0.4)" 
                : "0 10px 25px -5px rgba(77, 208, 225, 0.4)";

              return (
                <div
                  key={ticket.ticket_id}
                  onClick={() => handleBuy(ticket.ticket_id, ticket.price?.unit_price || 0)}
                  className={`bg-[#2A2D3A] rounded-2xl p-6 cursor-pointer transform hover:-translate-y-1 transition-all duration-300 relative group`}
                  style={{ 
                    borderBottom: `3px solid ${themeColor}`,
                    boxShadow: glowShadow
                  }}
                >
                  {/* Overlay for hover state to indicate clickability */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-[2px] z-10">
                    <span className="text-white font-black uppercase tracking-widest border-2 border-white px-6 py-2 rounded-full">
                      {processing ? "Processing..." : "Buy Ticket"}
                    </span>
                  </div>

                  {/* Header: Event Name & Venue */}
                  <div className="mb-5 pb-4 border-b border-gray-700/50">
                    <h3 className="text-lg font-black text-white uppercase line-clamp-1 mb-1">
                      {ticket.concert?.title || "Tên sự kiện"}
                    </h3>
                    <p className="text-gray-400 text-[11px] font-bold tracking-wider truncate">
                      📍 {ticket.venue?.name || "Địa điểm chưa xác định"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="w-4 h-4 rounded-full shadow-lg" 
                      style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}
                    ></div>
                    <span className="text-lg font-black text-white tracking-widest">
                      {ticket.tier?.name || (isVIP ? "VIP" : "Standard")}
                    </span>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-y-4 text-sm items-center">
                    {/* Row 1 */}
                    <div>
                      <span 
                        className="px-3 py-1 rounded-full text-white font-bold text-[10px] uppercase tracking-wider"
                        style={{ backgroundColor: themeColor }}
                      >
                        {ticket.quantity > 1 ? "Not sold individually" : "Sold individually"}
                      </span>
                    </div>
                    <div className="text-white font-bold text-right text-xs tracking-wider">
                      {ticket.ticket_id?.slice(-6).toUpperCase() || "TICKET"}
                    </div>

                    {/* Row 2 */}
                    <div className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">Quantity</div>
                    <div className="text-white font-black text-right">{ticket.quantity || 1}</div>

                    {/* Row 3 */}
                    <div className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">Showtime</div>
                    <div className="text-white font-bold text-right text-xs">
                      {ticket.concert?.concert_date 
                        ? new Date(ticket.concert.concert_date).toLocaleString('en-US', { 
                            hour: '2-digit', minute: '2-digit', 
                            month: 'long', day: 'numeric', year: 'numeric' 
                          }) 
                        : "19:00, April 25, 2026"}
                    </div>

                    {/* Row 4 */}
                    <div className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">Area</div>
                    <div className="text-white font-black text-right uppercase">
                      {ticket.zone?.zone_name || "N/A"}
                    </div>

                    {/* Row 5: Seat details */}
                    <div className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">Seat</div>
                    <div className="text-white font-bold text-right text-xs">
                      {ticket.seat?.label 
                        ? `Ghế ${ticket.seat.label} - ${ticket.tier?.name || (isVIP ? "VIP" : "Standard")}` 
                        : "Khu vực đứng"}
                    </div>

                    {/* Row 6 */}
                    <div className="text-gray-400 font-bold text-[11px] uppercase tracking-wider mt-2">Price per ticket</div>
                    <div 
                      className="font-black text-right text-lg mt-2 tracking-wide" 
                      style={{ color: themeColor }}
                    >
                      {(ticket.price?.unit_price || 0).toLocaleString()} VNĐ
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-[#2A2D3A] rounded-[40px] shadow-2xl border border-gray-800">
            <p className="text-gray-400 font-bold tracking-widest uppercase">
              No tickets available right now
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResaleMarket;
