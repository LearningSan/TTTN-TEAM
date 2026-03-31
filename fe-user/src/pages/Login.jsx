import React, { useState, useEffect } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { RiLockPasswordLine, RiEyeOffLine, RiEyeLine } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  // 1. Khai báo State để lưu thông tin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    // Lấy origin từ .env, nếu không có thì lấy từ API URL nhưng cắt bỏ phần /api
    const rawOrigin =
      import.meta.env.VITE_SERVER_ORIGIN ||
      import.meta.env.VITE_API_URL?.replace("/api", "");

    // Đảm bảo không có dấu / ở cuối (ví dụ: biến thành http://localhost:3000)
    const serverOrigin = rawOrigin?.replace(/\/$/, "");

    const receiveMessage = (event) => {
      console.log("Origin nhận được:", event.origin);
      console.log("Origin mong đợi:", serverOrigin);

      if (event.origin !== serverOrigin) return;

      if (event.data === "LOGIN_SUCCESS") {
        alert("Đăng nhập bằng Google thành công!");
        // Chuyển hướng và load lại để nhận Cookie mới từ Backend
        window.location.href = "/";
      }
    };

    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, []);

  // 2. Hàm mở Popup Google
  const handleGoogleLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const apiUrl = import.meta.env.VITE_API_URL;

    const popup = window.open(
      `${apiUrl}/auth/google`,
      "Google Login",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      alert("Vui lòng cho phép trình duyệt mở Popup để đăng nhập Google!");
    }
  };
  // 3. Hàm mở Popup Facebook
  const handleFacebookLogin = () => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const apiUrl = import.meta.env.VITE_API_URL;

    // Gọi đến Route khởi tạo Facebook Auth trên Backend
    window.open(
      `${apiUrl}/auth/facebook`,
      "Facebook Login",
      `width=${width},height=${height},left=${left},top=${top}`,
    );
  };

  // 4. Hàm xử lý Login thông thường
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          email: email,
          password: password,
          deviceInfo: navigator.userAgent,
        },
        { withCredentials: true },
      );

      if (response.data && (response.data.user_id || response.data.email)) {
        localStorage.setItem("user", JSON.stringify(response.data));
        alert("Đăng nhập thành công!");
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response && error.response.status === 401) {
        alert("Sai email hoặc mật khẩu!");
      } else {
        alert("Lỗi hệ thống. Vui lòng kiểm tra lại Backend!");
      }
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-[#101114] font-sans">
      {/* Header */}
      <header className="bg-black text-white p-4 shadow-md">
        <h1 className="text-2xl font-black tracking-tighter ml-8">TICKETX</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center bg-gradient-to-r from-[#8D1B1B] via-[#2B2D33] to-[#070E2A] p-4">
        <div className="flex flex-col md:flex-row w-full max-w-5xl bg-[#FBD9FA]/20 backdrop-blur-sm rounded-[40px] overflow-hidden shadow-2xl">
          {/* Left Side: Illustration */}
          <div className="hidden md:flex md:w-1/2 p-8 items-center justify-center">
            <div className="w-full h-full rounded-[40px] overflow-hidden shadow-inner bg-[#070E2A]">
              <img
                src="https://i.pinimg.com/236x/87/6a/a6/876aa6769737ce65aee4fc9fcdf8d513.jpg"
                alt="Illustration"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            <div className="bg-[#E9ECEF]/90 rounded-[30px] p-10 shadow-lg text-center">
              <h2 className="text-4xl font-black text-[#8D1B1B] mb-8 uppercase italic">
                Login
              </h2>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="text-left">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 ml-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/70 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC72A1]"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 ml-2">
                    Password
                  </label>
                  <div className="relative">
                    <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-3 bg-white/70 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC72A1]"
                    />
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <RiEyeLine /> : <RiEyeOffLine />}
                    </div>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 bg-white rounded-full text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <FcGoogle size={18} /> Google
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-blue-800 shadow-sm"
                    onClick={handleFacebookLogin}
                  >
                    <FaFacebook size={18} className="text-[#1877F2]" /> Facebook
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="
                    w-full py-3 mt-4 
                    /* Hiệu ứng gradient từ trên xuống dưới */
                    bg-gradient-to-b from-[#AC72A1] to-[#3B1E54] 
                    text-white font-bold 
                    /* Bo tròn hoàn toàn hai đầu */
                    rounded-full 
                    /* Hiệu ứng đổ bóng phía dưới nút */
                    shadow-[0px_4px_10px_rgba(0,0,0,0.5)] 
                    hover:brightness-110 transition-all 
                    text-2xl tracking-wider
                    "
                >
                  Login
                </button>

                {/* Footer Links */}
                <div className="flex justify-between mt-6 text-sm font-bold text-gray-800">
                  <Link to="/register" className="hover:underline">
                    Register
                  </Link>
                  <a href="#" className="hover:underline">
                    Forget pass ?
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
