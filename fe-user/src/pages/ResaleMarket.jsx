import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen bg-[#F5F5F5] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black uppercase italic border-l-8 border-[#8D1B1B] pl-4">
              Resale Market
            </h2>
            <p className="text-gray-500 font-bold mt-2">
              Chợ vé giữa người dùng với nhau
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 font-bold">
            Đang tải danh sách vé...
          </div>
        ) : resaleTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resaleTickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                className="bg-white rounded-[35px] overflow-hidden shadow-lg border-2 border-transparent hover:border-[#8D1B1B] transition-all group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={
                      ticket.concert?.banner_url ||
                      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000"
                    }
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt="banner"
                  />
                  <div className="absolute top-4 right-4 bg-[#8D1B1B] text-white px-4 py-1 rounded-full text-xs font-black uppercase">
                    {ticket.zone?.zone_name || "N/A"}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-black uppercase mb-3 line-clamp-1">
                    {ticket.concert?.title || "Vé Concert"}
                  </h3>

                  <div className="space-y-2 mb-6 text-gray-500 font-bold text-xs">
                    <p className="flex items-center gap-2">
                      <HiOutlineLocationMarker className="text-[#8D1B1B]" />{" "}
                      {ticket.venue?.name || "Địa điểm"}
                    </p>
                    <p className="flex items-center gap-2">
                      <HiOutlineTicket className="text-[#8D1B1B]" /> Ghế:{" "}
                      {ticket.seat?.label || "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-200">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">
                        Giá sang nhượng
                      </p>
                      <p className="text-xl font-black text-[#8D1B1B]">
                        {(ticket.price?.unit_price || 0).toLocaleString()} đ
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleBuy(
                          ticket.ticket_id,
                          ticket.price?.unit_price || 0,
                        )
                      }
                      disabled={processing}
                      className="bg-black text-white px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-[#8D1B1B] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {processing ? "Đang xử lý..." : "Mua ngay"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] shadow-inner">
            <p className="text-gray-400 font-bold italic">
              Hiện chưa có vé nào được rao bán trên chợ.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResaleMarket;
