import React, { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineTicket,
  HiOutlineSwitchHorizontal,
  HiOutlineFilter,
} from "react-icons/hi";
import { IoWalletOutline } from "react-icons/io5";

const Marketplace = () => {
  // Mock dữ liệu vé đang được rao bán
  const [listings, setListings] = useState([
    {
      id: 1,
      concert: "SƠN TÙNG M-TP: SKY TOUR",
      seat: "VIP - A1",
      seller: "Dinh123",
      price: 2500000,
      original_price: 3000000,
      status: "Available",
    },
    {
      id: 2,
      concert: "BLACKPINK WORLD TOUR",
      seat: "CAT 1 - B2",
      seller: "Ngoc_STU",
      price: 1800000,
      original_price: 2000000,
      status: "Available",
    },
  ]);

  return (
    <div className="min-h-screen bg-white font-sans py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="flex-1">
            <h2 className="text-3xl font-black uppercase text-gray-800 italic border-l-8 border-[#8D1B1B] pl-4 mb-6">
              Sàn Trao Đổi Vé
            </h2>
            <div className="relative group max-w-xl">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện hoặc vị trí ghế..."
                className="w-full bg-gray-50 border-2 border-gray-100 p-4 pl-12 rounded-2xl outline-none focus:border-[#8D1B1B] transition-all font-medium"
              />
            </div>
          </div>

          <button className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-[#8D1B1B] transition-all shadow-xl active:scale-95">
            <HiOutlineSwitchHorizontal size={20} />
            Đăng bán vé của bạn
          </button>
        </div>

        {/* Danh sách vé đang rao bán */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-black rounded-[35px] overflow-hidden border border-gray-800 shadow-2xl flex flex-col group"
            >
              {/* Phần trên: Thông tin vé */}
              <div className="p-8 border-b border-dashed border-gray-700 relative">
                {/* Rãnh vé trang trí */}
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-white rounded-full"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full"></div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] bg-[#8D1B1B] text-white px-3 py-1 rounded-full font-black uppercase">
                    Marketplace
                  </span>
                  <span className="text-gray-500 text-[10px] font-mono">
                    ID: #{ticket.id}0024
                  </span>
                </div>

                <h3 className="text-white text-xl font-black uppercase mb-4 leading-tight group-hover:text-[#8D1B1B] transition-colors">
                  {ticket.concert}
                </h3>

                <div className="space-y-2 text-xs text-gray-400">
                  <p className="flex items-center gap-2">
                    <HiOutlineTicket className="text-[#8D1B1B]" /> Ghế:{" "}
                    <b className="text-white">{ticket.seat}</b>
                  </p>
                  <p className="flex items-center gap-2">
                    <HiOutlineUser className="text-[#8D1B1B]" /> Người bán:{" "}
                    <b className="text-white">{ticket.seller}</b>
                  </p>
                </div>
              </div>

              {/* Phần dưới: Giá & Hành động */}
              <div className="p-8 bg-[#1A1A1A] flex-1 flex flex-col justify-between">
                <div className="mb-6">
                  <p className="text-gray-500 text-[10px] font-bold uppercase line-through italic">
                    Gốc: {ticket.original_price.toLocaleString()} đ
                  </p>
                  <p className="text-[#8D1B1B] text-2xl font-black">
                    {ticket.price.toLocaleString()} đ
                  </p>
                </div>

                <button className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#8D1B1B] hover:text-white transition-all shadow-lg active:scale-95">
                  <IoWalletOutline size={18} />
                  Mua ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (Nếu không tìm thấy) */}
        {listings.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest">
              Hiện chưa có vé nào được đăng bán.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Import các Icon bị thiếu (đã cài đặt ở bước trước)
import { HiOutlineUser } from "react-icons/hi";

export default Marketplace;
