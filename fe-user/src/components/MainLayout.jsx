import React, { useState, useEffect, useRef } from "react"; // Đã thêm useRef vào đây
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { GiTicket } from "react-icons/gi";
import { FaUserCircle, FaChevronDown, FaRegUser } from "react-icons/fa"; // Thêm FaRegUser
import { FiLogOut } from "react-icons/fi"; // Thêm FiLogOut
import { AiFillHome } from "react-icons/ai";
import axios from "axios";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Ref đã hoạt động vì đã import ở trên
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Logic kiểm tra trang để đổi màu giao diện
  const isDetailPage =
    location.pathname === "/" ||
    location.pathname.includes("/concert/") ||
    location.pathname.includes("/my-tickets") ||
    location.pathname.includes("/resale-market") ||
    location.pathname.includes("/profile") ||
    location.pathname.includes("/order-success") ||
    // location.pathname.includes("/selection") ||
    // location.pathname.includes("/payment") ||
    // location.pathname.includes("/nhap") ||
    location.pathname.includes("/checkout");
  const headerStyles = isDetailPage
    ? "bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#00F2FF] border-none shadow-lg"
    : "bg-white border-b border-gray-100 shadow-sm";

  const textColor = isDetailPage ? "text-white" : "text-gray-700";

  // Đồng bộ User từ Server/Storage
  useEffect(() => {
    const syncUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    window.addEventListener("storage", syncUser);

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/me`, {
          withCredentials: true,
        });
        if (response.data?.user_id) {
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("user");
          setUser(null);
        }
      }
    };
    fetchUserProfile();
    return () => window.removeEventListener("storage", syncUser);
  }, [location]);

  // Xử lý đóng Dropdown khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/logout`,
        {},
        { withCredentials: true },
      );
    } catch (e) {}
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header
        className={`${headerStyles} py-4 px-12 flex items-center justify-between sticky top-0 z-50 transition-all duration-500`}
      >
        {/* LOGO */}
        <Link to="/">
          <h1 className="text-3xl font-[900] tracking-tighter uppercase transition-colors">
            {isDetailPage ? (
              <span className="text-white">TICKETX</span>
            ) : (
              <>
                <span className="text-[#FF2D95]">TICKET</span>
                <span className="text-[#00F2FF]">X</span>
              </>
            )}
          </h1>
        </Link>

        {/* MENU BÊN PHẢI */}
        <div
          className={`flex items-center gap-6 text-[13px] font-black uppercase ${textColor}`}
        >
          {user ? (
            <div className="flex items-center gap-4 relative">
              <Link
                to="/my-tickets"
                className="flex items-center gap-1 hover:opacity-80"
              >
                <GiTicket size={18} /> My ticket
              </Link>

              {/* Account Button */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    isDetailPage
                      ? "bg-white/20 backdrop-blur-md text-white border border-white/10"
                      : "bg-gray-100 text-gray-900 border border-transparent"
                  } hover:scale-105 active:scale-95`}
                >
                  <div className="w-6 h-6 bg-black rounded-full overflow-hidden border border-white/30">
                    <FaUserCircle className="text-white w-full h-full" />
                  </div>
                  <span className="normal-case font-bold">
                    {user.name || "Account"}
                  </span>
                  <FaChevronDown
                    size={10}
                    className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* DROPDOWN MENU */}
                {dropdownOpen && (
                  <div
                    className={`absolute top-full right-0 mt-3 w-48 rounded-xl shadow-2xl p-2 border transition-all z-[100] ${
                      isDetailPage
                        ? "bg-black/90 border-white/10 backdrop-blur-xl text-white"
                        : "bg-white border-gray-100 text-gray-800"
                    }`}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                        isDetailPage ? "hover:bg-white/10" : "hover:bg-gray-100"
                      }`}
                    >
                      <FaRegUser size={14} /> Profile
                    </Link>

                    <div
                      className={`my-1 h-px ${isDetailPage ? "bg-white/10" : "bg-gray-100"}`}
                    />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 hover:text-[#FF2D95]"
            >
              <FaUserCircle size={18} /> Sign in
            </Link>
          )}

          <Link to="/" className="hover:scale-110 transition-transform">
            <AiFillHome size={22} />
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
