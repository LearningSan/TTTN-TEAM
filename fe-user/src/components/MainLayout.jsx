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
  // Trong MainLayout.jsx
  useEffect(() => {
    // Hàm cập nhật user từ localStorage
    const syncUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    // 1. Lắng nghe sự kiện 'storage' (khi tab/popup khác thay đổi localStorage)
    window.addEventListener("storage", syncUser);

    // 2. Đồng bộ ngay lập tức từ server (giữ nguyên logic của bạn)
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/me`, {
          withCredentials: true,
        });
        if (response.data && response.data.user_id) {
          const userData = response.data;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Lỗi xác thực:", error);
        // Nếu lỗi 401 (chưa đăng nhập) thì xóa local
        if (error.response?.status === 401) {
          localStorage.removeItem("user");
          setUser(null);
        }
      }
    };

    fetchUserProfile();

    // Cleanup khi unmount
    return () => window.removeEventListener("storage", syncUser);
  }, [location]); // Chạy lại khi chuyển trang hoặc mount
  const handleLogout = async () => {
    try {
      // 1. Gọi API Logout để xóa Session/Cookie trên Server
      await axios.post(
        `${import.meta.env.VITE_API_URL}/logout`,
        {},
        { withCredentials: true },
      );
    } catch (error) {
      console.error("Lỗi Logout Server:", error);
    }

    // 2. Xóa sạch dữ liệu trong localStorage
    localStorage.removeItem("user");

    // 3. Cập nhật state về null ngay lập tức
    setUser(null);

    // 4. Làm mới trang để xóa sạch mọi dấu vết
    window.location.href = "/";
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
          <Link
            to="/my-tickets"
            className="flex items-center gap-1 hover:text-[#8D1B1B]"
          >
            <GiTicket size={18} /> My ticket
          </Link>
          {/* Hiển thị tên người dùng */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Thay 'flex-col' thành 'flex-row' hoặc xóa hẳn 'flex-col' đi */}
              <Link
                to="/resale-market"
                className="text-[10px] bg-gray-100 border border-gray-200 px-2 py-1 rounded font-bold hover:bg-gray-200 transition-colors"
              >
                Mua bán lại vé
              </Link>
              <div className="flex flex-row items-center gap-1">
                <span className="text-[#8D1B1B] text-[11px] font-black whitespace-nowrap">
                  WELCOME,
                </span>
                <span className="text-gray-900 font-black whitespace-nowrap">
                  {user.name || user.email}
                </span>
              </div>
              <Link
                to="/profile"
                className="text-[10px] bg-gray-100 border border-gray-200 px-2 py-1 rounded font-bold hover:bg-gray-200 transition-colors"
              >
                Profile
              </Link>

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
