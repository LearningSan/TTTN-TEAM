import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "", // 1. Thêm trường phone vào state
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra định dạng mật khẩu
    if (!validatePassword(formData.password)) {
      setError("Mật khẩu phải tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số!");
      return;
    }

    // Kiểm tra khớp mật khẩu
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      // 2. Gửi dữ liệu bao gồm cả phone lên Backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/signup`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone, // Gửi kèm số điện thoại
          password: formData.password,
        },
      );

      if (response.status === 200) {
        alert("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
        navigate("/login");
      }
    } catch (err) {
      let msg = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      
      // Việt hóa các thông báo lỗi từ Backend
      if (msg === "Name must be between 2 and 50 characters") {
        msg = "Họ tên phải từ 2 đến 50 ký tự!";
      } else if (msg.includes("Password must be at least 8 characters")) {
        msg = "Mật khẩu phải tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số!";
      } else if (msg === "Invalid phone number format") {
        msg = "Số điện thoại không đúng định dạng! bắt đầu từ 0 và có 10 ký tự!";
      } else if (msg === "User already exists") {
        msg = "Email đã được sử dụng!";
      }
      
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans relative overflow-hidden">
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
      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="relative p-[3px] rounded-[40px] bg-gradient-to-r from-[#FF2D95] to-[#00E5FF] overflow-hidden">
          <div className="bg-white w-[400px] rounded-[39px] p-10 flex flex-col items-start">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-wider">
              Sign Up
            </h1>
            <p className="text-xm text-gray-400 mb-8 font-medium">
              You have a account,{" "}
              <Link to="/login" className="text-blue-400 hover:underline">
                Sign in
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-5">
              {/* Name */}
              <div className="p-[1px] rounded-full bg-gradient-to-r from-[#FF2D95] to-[#00E5FF]">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-6 py-3 rounded-full bg-white outline-none text-sm text-gray-500"
                  required
                />
              </div>
              {/* Email */}
              <div className="p-[1px] rounded-full bg-gradient-to-r from-[#FF2D95] to-[#00E5FF]">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-6 py-3 rounded-full bg-white outline-none text-sm text-gray-500"
                  required
                />
              </div>
              {/* Phone */}
              <div className="p-[1px] rounded-full bg-gradient-to-r from-[#FF2D95] to-[#00E5FF]">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-6 py-3 rounded-full bg-white outline-none text-sm text-gray-500"
                  required
                />
              </div>
              {/* Password */}
              <div className="p-[1px] rounded-full bg-gradient-to-r from-[#FF2D95] to-[#00E5FF]">
                <input
                  type="password"
                  name="password"
                  placeholder="Password (min 8 chars, A-z, 0-9)"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-6 py-3 rounded-full bg-white outline-none text-sm text-gray-500"
                  required
                />
              </div>
              {/* Confirm Password */}
              <div className="p-[1px] rounded-full bg-gradient-to-r from-[#FF2D95] to-[#00E5FF]">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-6 py-3 rounded-full bg-white outline-none text-sm text-gray-500"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-900/20 border border-red-900/50 text-red-500 px-4 py-3 rounded-xl text-sm font-bold text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-4 
                  bg-gradient-to-r from-[#FF2D95] via-[#9181C4] to-[#2BF3E0] 
                  text-lg  text-white font-extrabold font-['Nunito'] tracking-wider 
                  rounded-full 
                  shadow-[0_10px_20px_-5px_rgba(255,45,149,0.4)] 
                  ring-1 ring-inset ring-white/20 /* Tạo viền sáng xung quanh button */
                  hover:brightness-120 hover:shadow-[0_15px_25px_-5px_rgba(255,45,149,0.5)] 
                  transition-all duration-300 active:scale-[0.97]"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
