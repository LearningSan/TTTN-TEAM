import React, { useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { RiLockPasswordLine, RiEyeOffLine } from "react-icons/ri";
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
  // 2. Hàm xử lý khi nhấn nút Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Gọi địa chỉ API của Next.js BE (Port 3000)
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          email: email, // Lấy từ state
          password: password, // Lấy từ state
        },
      );

      // Nếu BE trả về status 200 (thành công)
      if (response.data.token) {
        // Lưu token vào localStorage để dùng cho các trang sau
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        alert("Đăng nhập thành công! Chào mừng " + response.data.user.name);

        // Chuyển hướng người dùng về trang chủ
        navigate("/");
      }
    } catch (error) {
      // Xử lý lỗi (ví dụ 401: Invalid email or password)
      const errorMessage = error.response?.data?.message || "Đã có lỗi xảy ra";
      alert("Thất bại: " + errorMessage);
      console.error("Login Error:", error);
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
            <div className="rounded-[40px] overflow-hidden shadow-inner bg-[#070E2A]">
              <img
                src="https://via.placeholder.com/500" // Thay bằng link ảnh chậu cây của bạn
                alt="Illustration"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            <div className="bg-[#E9ECEF]/90 rounded-[30px] p-10 shadow-lg text-center">
              <h2 className="text-4xl font-black text-[#8D1B1B] mb-8">LOGIN</h2>

              <form className="space-y-4" onSubmit={handleLogin}>
                {/* Email Input */}
                <div className="text-left">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 ml-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter Email"
                      value={email} // Gán giá trị từ state
                      onChange={(e) => setEmail(e.target.value)} // Cập nhật state
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/70 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC72A1]"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="text-left">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 ml-2">
                    Password
                  </label>
                  <div className="relative">
                    <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      value={password} // Gán giá trị từ state
                      onChange={(e) => setPassword(e.target.value)} // Cập nhật state
                      required
                      className="w-full pl-10 pr-10 py-3 bg-white/70 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC72A1]"
                    />
                    <RiEyeOffLine
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white rounded-md shadow-sm border border-gray-200 text-sm font-medium"
                  >
                    <FcGoogle size={18} /> Google
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#E9ECEF] rounded-md shadow-sm border border-gray-200 text-sm font-medium text-blue-800"
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
