import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineMail,
  HiOutlineKey,
  HiOutlineChevronDown,
} from "react-icons/hi";
import { RiLockPasswordLine, RiEyeOffLine, RiEyeLine } from "react-icons/ri";
import { AiFillHome } from "react-icons/ai";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/forgot-password`, { email });
      alert("Mã OTP đã được gửi về email của bạn!");
      setStep(2);
    } catch (error) {
      alert(
        error.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/reset-password`, { email, otp, newPassword });
      alert("Đổi mật khẩu thành công!");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xác thực!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HEADER GIỐNG TRANG LOGIN */}
      <header className="bg-white text-[#4A5568] py-4 px-12 flex items-center justify-between border-b border-gray-100 shadow-sm z-20">
        <div className="flex items-center">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-3xl font-black tracking-tighter text-[#8D1B1B]">
              TICKETX
            </h1>
          </Link>
        </div>

        <nav className="flex items-center gap-10 text-sm font-medium">
          <a href="#" className="hover:text-black transition-colors">
            Help
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Contact us
          </a>
          {/* <div className="flex items-center gap-1 cursor-pointer hover:text-black transition-colors">
            <span>English</span>
            <HiOutlineChevronDown size={16} />
          </div> */}
          <Link
            to="/register"
            className="ml-4 hover:text-black transition-colors border-l pl-10 border-gray-300"
          >
            Sign Up
          </Link>
          <Link
            to="/"
            className="text-[#2D3748] hover:text-black transition-all"
          >
            <AiFillHome size={22} />
          </Link>
        </nav>
      </header>

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Hiệu ứng nền đỏ mờ phía dưới */}
        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#8D1B1B] to-transparent opacity-80" />

        <div className="z-10 w-[450px] bg-white border-[3px] border-[#31A1EE] rounded-[40px] p-10 shadow-xl">
          <h2 className="text-3xl font-bold text-[#444] mb-2 uppercase tracking-tight text-center">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8 px-4">
            {step === 1
              ? "Enter your email to receive an OTP code"
              : "Enter the OTP and your new password"}
          </p>

          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div className="text-left">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-400 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <button
                disabled={loading}
                className="w-full py-3 bg-[#7A2121] text-white font-bold rounded-full text-lg shadow-lg hover:bg-[#5a1818] transition-all disabled:bg-gray-400"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="text-left">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  OTP Code
                </label>
                <div className="relative">
                  <HiOutlineKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-400 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  New Password
                </label>
                <div className="relative">
                  <RiLockPasswordLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-10 py-3 border border-gray-400 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <RiEyeLine size={20} />
                    ) : (
                      <RiEyeOffLine size={20} />
                    )}
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full py-3 bg-[#7A2121] text-white font-bold rounded-full text-lg shadow-lg hover:bg-[#5a1818] transition-all disabled:bg-gray-400"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-blue-500 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
