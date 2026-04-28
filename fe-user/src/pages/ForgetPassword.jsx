import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { RiLockPasswordLine, RiEyeOffLine, RiEyeLine } from "react-icons/ri";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-white font-sans relative overflow-hidden"
    >
      {/* Background blurs */}
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] 
          translate-x-[-75%] translate-y-[50%]
          bg-[#FF2D95] opacity-[0.5] blur-[120px] rounded-full pointer-events-none"
      />

      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] 
          translate-x-[75%] translate-y-[25%]
          bg-[#00E5FF] opacity-[0.5] blur-[120px] rounded-full pointer-events-none"
      />

      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="relative p-[3px] rounded-[40px] bg-gradient-to-r from-[#FF2D95] to-[#00E5FF] overflow-hidden">
          <div className="bg-white w-[400px] rounded-[39px] p-10 flex flex-col items-start">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-wider">
              {step === 1 ? "FORGOT PASSWORD" : "RESET PASSWORD"}
            </h1>
            <p className="text-xm text-gray-400 mb-8 font-medium">
              {step === 1
                ? "Enter your email to receive an OTP code"
                : "Enter the OTP and your new password"}
            </p>

            {step === 1 ? (
              <form className="w-full space-y-5" onSubmit={handleSendOtp}>
                <div className="space-y-2">
                  <label className="text-xm font-semibold font-['Nunito'] ml-2 tracking-wider">
                    Email
                  </label>
                  <div className="p-[1px] rounded-full bg-gradient-to-r from-[#FF2D95] to-[#00E5FF]">
                    <input
                      type="email"
                      placeholder="admin@gmail.com......."
                      className="w-full px-6 py-3 rounded-full bg-white outline-none text-sm text-gray-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 mt-6
                    bg-gradient-to-r from-[#FF2D95] via-[#9181C4] to-[#2BF3E0] 
                    text-lg text-white font-extrabold font-['Nunito'] tracking-wider 
                    rounded-full 
                    shadow-[0_10px_20px_-5px_rgba(255,45,149,0.4)] 
                    ring-1 ring-inset ring-white/20 
                    hover:brightness-120 hover:shadow-[0_15px_25px_-5px_rgba(255,45,149,0.5)] 
                    transition-all duration-300 active:scale-[0.97] disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form className="w-full space-y-5" onSubmit={handleResetPassword}>
                <div className="space-y-2">
                  <label className="text-xm font-semibold font-['Nunito'] ml-2 tracking-wider">
                    OTP Code
                  </label>
                  <div className="p-[1px] rounded-full bg-gradient-to-r from-[#FF2D95] to-[#00E5FF]">
                    <input
                      type="text"
                      placeholder="123456"
                      className="w-full px-6 py-3 rounded-full bg-white outline-none text-sm text-gray-500"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xm font-semibold font-['Nunito'] ml-2 tracking-wider">
                    New Password
                  </label>
                  <div className="p-[1px] rounded-full bg-gradient-to-r from-[#FF2D95] to-[#00E5FF]">
                    <div className="relative bg-white rounded-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••"
                        className="w-full px-6 py-3 rounded-full bg-transparent outline-none text-sm"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <div
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-300 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <RiEyeLine size={18} />
                        ) : (
                          <RiEyeOffLine size={18} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 mt-6
                    bg-gradient-to-r from-[#FF2D95] via-[#9181C4] to-[#2BF3E0] 
                    text-lg text-white font-extrabold font-['Nunito'] tracking-wider 
                    rounded-full 
                    shadow-[0_10px_20px_-5px_rgba(255,45,149,0.4)] 
                    ring-1 ring-inset ring-white/20 
                    hover:brightness-120 hover:shadow-[0_15px_25px_-5px_rgba(255,45,149,0.5)] 
                    transition-all duration-300 active:scale-[0.97] disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}

            <div className="w-full mt-8 text-center">
              <Link
                to="/login"
                className="text-sm font-semibold text-blue-400 hover:text-blue-600 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default ForgotPassword;
