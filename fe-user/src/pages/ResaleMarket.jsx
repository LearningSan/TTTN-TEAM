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
import CategoryNav from "../components/CategoryNav";

const ResaleMarket = () => {
  const [resaleTickets, setResaleTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); 
  const [currentUser, setCurrentUser] = useState(null);
  const [myTransfers, setMyTransfers] = useState([]); // Danh sách vé của chính mình đang bán
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchResaleTickets = async () => {
      try {
        setLoading(true);
        
        // 1. Lấy danh sách tất cả vé đang bán trên sàn
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/ticket`,
          {
            params: {
              status: "TRANSFERRED",
              page: 1,
              pageSize: 50,
            },
            withCredentials: true,
            timeout: 60000,
          },
        );

        // 2. Lấy danh sách vé của chính mình đang rao bán (để so sánh)
        let myTransfersData = [];
        let myListedTicketsData = [];
        
        try {
          // Lấy vé đang có người mua (PENDING)
          const resMyTrans = await axios.get(
            `${import.meta.env.VITE_API_URL}/resale/my-transfers`,
            { withCredentials: true }
          );
          myTransfersData = resMyTrans.data?.data || resMyTrans.data || [];
          console.log("🛠️ My Pending Transfers:", myTransfersData);
          
          // Lấy vé mình đã đăng lên sàn nhưng chưa có người mua
          const resMyListed = await axios.get(
            `${import.meta.env.VITE_API_URL}/ticket/user`,
            { 
              params: { status: "TRANSFERRED" },
              withCredentials: true 
            }
          );
          // API /ticket/user có thể trả về mảng trực tiếp hoặc mảng lồng trong data.data
          let listedOrders = resMyListed.data?.data?.data || resMyListed.data?.data || [];
          if (!Array.isArray(listedOrders)) listedOrders = [];
          
          myListedTicketsData = listedOrders.flatMap(order => order.tickets || []);
          console.log("🛠️ My Listed Tickets (Waiting Buyer):", myListedTicketsData);

          // Gộp cả 2 danh sách để nhận diện vé của mình
          setMyTransfers([...myTransfersData, ...myListedTicketsData]);
        } catch (err) {
          console.error("Không thể lấy danh sách vé của tôi:", err);
        }

        const orders = response.data?.data?.data || [];
        console.log("🎟️ Market Orders:", orders);

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
        if (error.response?.status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResaleTickets();
  }, [navigate]);

  // Trong ResaleMarket.jsx, hàm handleBuy
  const handleBuy = async (ticketId, price) => {
    try {
      setProcessing(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/resale/buy`,
        { ticket_id: ticketId },
        { withCredentials: true },
      );

      const ticket = resaleTickets.find((t) => t.ticket_id === ticketId);

      // Chuyển hướng người mua sang Payment với đầy đủ thông tin để hiển thị
      navigate("/payment", {
        state: {
          isResale: true,
          isBuyer: true,
          isSeller: false,
          nftData: res.data?.data || res.data,
          amount: price,
          concert: {
            ...ticket?.concert,
            venue_name: ticket?.venue?.name
          },
          // Map lại thông tin ghế để khớp với Payment.jsx (seat.row_name, seat.seat_number...)
          selectedSeats: ticket?.seat ? [{
            ...ticket.seat,
            row_name: ticket.seat.row,
            seat_number: ticket.seat.number,
            zone_name: ticket.zone?.zone_name,
            price: price
          }] : [],
          standingTickets: !ticket?.seat ? {
            [ticket?.zone?.zone_id || "resale"]: 1
          } : {},
          zones: [ticket?.zone], // Để Payment.jsx tìm thấy zone_name và giá
          orderId: ticket?.order_id
        },
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      if (errorMsg === "Cannot buy your own ticket") {
        alert("Bạn không thể mua lại vé của chính mình!");
      } else if (errorMsg === "Ticket is being transferred") {
        alert("Vé này đang trong quá trình chuyển nhượng hoặc đã có người mua!");
      } else {
        alert("Lỗi mua vé: " + errorMsg);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelResale = async (ticketId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy pass vé này không?")) return;

    try {
      setProcessing(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/resale/cancel`,
        { ticket_id: ticketId },
        { withCredentials: true },
      );
      alert("Hủy pass vé thành công!");
      window.location.reload();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      if (errorMsg === "Cannot cancel: ticket already in transfer") {
        alert("Không thể hủy vì vé đã có người mua và đang trong quá trình chuyển nhượng!");
      } else {
        alert("Lỗi hủy pass: " + errorMsg);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#11131A] text-white font-sans selection:bg-pink-500/30">
      {/* Nav Section */}
      <CategoryNav />

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
            {resaleTickets.map((ticket, index) => {
              const isEven = index % 2 === 0;
              const isVIP = ticket.zone?.zone_name?.toLowerCase().includes("vip");
              const themeColor = isEven ? "#FF2D95" : "#00E5FF"; // Pink for even, Cyan for odd
              const glowShadow = isEven 
                ? "0 10px 25px -5px rgba(255, 45, 149, 0.4)" 
                : "0 10px 25px -5px rgba(0, 229, 255, 0.4)";

              const isOwnTicket = myTransfers.some(tr => {
                const myId = tr.ticket_id || tr.ticket?.ticket_id;
                return String(myId) === String(ticket.ticket_id);
              });

              return (
                <div
                  key={ticket.ticket_id}
                  className={`bg-[#2A2D3A] rounded-2xl p-6 relative group transform hover:-translate-y-1 transition-all duration-300`}
                  style={{ 
                    borderBottom: `3px solid ${themeColor}`,
                    boxShadow: glowShadow
                  }}
                >
                  {/* Overlay for hover state */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-2xl backdrop-blur-[2px] z-10 p-4">
                    {isOwnTicket ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelResale(ticket.ticket_id);
                        }}
                        disabled={processing}
                        className="px-8 py-3 bg-[#FF2D95] text-white font-black rounded-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,45,149,0.5)]"
                      >
                        {processing ? "Đang xử lý..." : "Hủy Pass"}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuy(ticket.ticket_id, ticket.price?.unit_price || 0);
                        }}
                        disabled={processing}
                        className={`px-8 py-3 ${isEven ? 'bg-[#FF2D95] shadow-[0_0_20px_rgba(255,45,149,0.5)]' : 'bg-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.5)]'} text-white font-black rounded-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all`}
                      >
                        {processing ? "Đang xử lý..." : "Mua Vé"}
                      </button>
                    )}
                    {isOwnTicket && (
                      <p className="text-[10px] text-gray-300 mt-3 font-bold uppercase tracking-wider">Đây là vé của bạn</p>
                    )}
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
                      {ticket.tier?.name || (isVIP ? "VIP" : "Standing")}
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
                      {(ticket.price?.unit_price || 0).toLocaleString()} Đ
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
