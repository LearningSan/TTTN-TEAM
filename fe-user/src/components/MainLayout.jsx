import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { GiTicket } from "react-icons/gi";
import { FaUserCircle } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import axios from "axios"; // Đảm bảo đã import axios

const MainLayout = () => {
  // 1. Khởi tạo state user từ localStorage để hiển thị ngay lập tức (tránh bị nháy)
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Kiểm tra nếu đang ở trang chi tiết concert
  const isDetailPage = location.pathname.includes("/concert/");
  // Thiết lập class dựa trên trang
  const headerBgColor = isDetailPage ? "bg-black" : "bg-white";
  const textColor = isDetailPage ? "text-white" : "text-gray-700";
  const borderColor = isDetailPage ? "border-none" : "border-b border-gray-100";

  // 2. Sử dụng useEffect để đồng bộ dữ liệu mới nhất từ server qua API /api/me
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Gọi API lấy thông tin user hiện tại
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/me`, {
          withCredentials: true, // Quan trọng để gửi kèm Cookie/Token nếu có
        });

        if (response.data?.success) {
          const freshUserData = response.data.data;
          setUser(freshUserData);
          // Cập nhật lại localStorage để các lần load sau nhanh hơn
          localStorage.setItem("user", JSON.stringify(freshUserData));
        }
      } catch (error) {
        // Nếu lỗi 401 (hết hạn phiên đăng nhập), có thể xóa user
        if (error.response?.status === 401) {
          localStorage.removeItem("user");
          setUser(null);
        }
        console.error("Lỗi lấy thông tin user:", error);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, []); // Chạy 1 lần khi load trang

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header
        className={`${headerBgColor} ${borderColor} py-4 px-12 flex items-center justify-between shadow-sm sticky top-0 z-50 transition-colors duration-300`}
      >
        <Link to="/">
          <h1 className="text-3xl font-black tracking-tighter text-[#8D1B1B]">
            TICKETX
          </h1>
        </Link>

        <div
          className={`flex items-center gap-6 text-[13px] font-bold uppercase ${textColor}`}
        >
          {" "}
          {/* <Link
            to="/my-tickets"
            className="flex items-center gap-1 hover:text-[#8D1B1B]"
          >
            <GiTicket size={18} /> My ticket
          </Link> */}
          {/* Hiển thị tên người dùng */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Thay 'flex-col' thành 'flex-row' hoặc xóa hẳn 'flex-col' đi */}
              <div className="flex flex-row items-center gap-1">
                <span className="text-[#8D1B1B] text-[11px] font-black whitespace-nowrap">
                  WELCOME,
                </span>
                <span className="text-gray-900 font-black whitespace-nowrap">
                  {user.name || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-[10px] bg-gray-100 border border-gray-200 px-2 py-1 rounded font-bold hover:bg-gray-200 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 hover:text-[#8D1B1B]"
            >
              <FaUserCircle size={18} /> Sign in
            </Link>
          )}
          <Link to="/">
            <AiFillHome size={20} />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
