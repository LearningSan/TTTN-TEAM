import React from "react";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#101114] font-sans">
      {/* Header */}
      <header className="bg-black text-white p-4 shadow-md">
        <h1 className="text-2xl font-black tracking-tighter ml-8">TICKETX</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center bg-gradient-to-r from-[#070E2A] via-[#2B2D33] to-[#8D1B1B] p-4">
        <div className="flex flex-col md:flex-row-reverse w-full max-w-5xl bg-[#FBD9FA]/20 backdrop-blur-sm rounded-[50px] overflow-hidden shadow-2xl">
          {/* Right Side: Illustration (Đảo sang phải) */}
          <div className="hidden md:flex md:w-1/2 p-8 items-center justify-center">
            <div className="rounded-[50px] overflow-hidden shadow-inner bg-[#070E2A]">
              <img
                src="https://via.placeholder.com/500" // Thay bằng link ảnh chậu cây của bạn
                alt="Illustration"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>

          {/* Left Side: Sign Up Form (Đảo sang trái) */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            <div className="bg-[#E9ECEF]/90 rounded-[40px] p-8 shadow-lg text-center">
              <h2
                className="
                  text-5xl font-black mb-6 uppercase tracking-tighter
                  /* Hiệu ứng Gradient cho chữ */
                  bg-gradient-to-b from-[#8D1B1B] to-[#070E2A] 
                  bg-clip-text text-transparent
                  /* Font chữ kéo dãn theo chiều dọc (nếu cần giống hệt mẫu) */
                  scale-y-110
                "
              >
                Sign Up
              </h2>

              <form className="space-y-3">
                {/* First Name */}
                <div className="text-left">
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 ml-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 bg-white/70 rounded-full text-sm focus:outline-none border border-transparent focus:border-[#AC72A1]"
                  />
                </div>

                {/* Company */}
                <div className="text-left">
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 ml-2">
                    Company
                  </label>
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="w-full px-4 py-2 bg-white/70 rounded-full text-sm focus:outline-none border border-transparent focus:border-[#AC72A1]"
                  />
                </div>

                {/* Position */}
                <div className="text-left">
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 ml-2">
                    Position
                  </label>
                  <input
                    type="text"
                    placeholder="CEO"
                    className="w-full px-4 py-2 bg-white/70 rounded-full text-sm focus:outline-none border border-transparent focus:border-[#AC72A1]"
                  />
                </div>

                {/* Phone */}
                <div className="text-left">
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 ml-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+1 800 123-34-45"
                    className="w-full px-4 py-2 bg-white/70 rounded-full text-sm focus:outline-none border border-transparent focus:border-[#AC72A1]"
                  />
                </div>

                {/* Email */}
                <div className="text-left">
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 ml-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 bg-white/70 rounded-full text-sm focus:outline-none border border-transparent focus:border-[#AC72A1]"
                  />
                </div>

                {/* Sign Up Button - Gradient từ trên xuống */}
                <div className="pt-4 px-10">
                  <button className="w-full py-3 bg-gradient-to-b from-[#AC72A1] to-[#3B1E54] text-white font-medium rounded-full shadow-[0px_4px_10px_rgba(0,0,0,0.4)] hover:brightness-110 transition-all text-xl">
                    Sign up
                  </button>
                </div>

                {/* Footer Links */}
                <div className="flex justify-between mt-6 px-4 text-xs font-black text-black">
                  <Link to="/login" className="hover:underline">
                    Create
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

export default Register;
