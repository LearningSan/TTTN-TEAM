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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
      setError(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8 bg-[#0A0A0A] p-10 rounded-3xl border border-gray-900 shadow-2xl">
        <div className="text-center">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            Join The <span className="text-[#8D1B1B]">Arena</span>
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            Create your warrior profile
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-500 px-4 py-3 rounded-xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-[#1A1A1A] border border-gray-800 rounded-2xl text-white focus:border-[#8D1B1B] outline-none transition-all font-medium"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-[#1A1A1A] border border-gray-800 rounded-2xl text-white focus:border-[#8D1B1B] outline-none transition-all font-medium"
            required
          />

          {/* 3. Thêm Input cho Phone */}
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-[#1A1A1A] border border-gray-800 rounded-2xl text-white focus:border-[#8D1B1B] outline-none transition-all font-medium"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password (min 8 chars, A-z, 0-9)"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-[#1A1A1A] border border-gray-800 rounded-2xl text-white focus:border-[#8D1B1B] outline-none transition-all font-medium"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-[#1A1A1A] border border-gray-800 rounded-2xl text-white focus:border-[#8D1B1B] outline-none transition-all font-medium"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#8D1B1B] text-white font-black py-5 rounded-2xl uppercase tracking-widest hover:bg-[#6D1515] transition-all shadow-lg shadow-[#8D1B1B]/20 mt-4 active:scale-95"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-8 font-bold uppercase">
          Already have an account?{" "}
          <Link to="/login" className="text-[#8D1B1B] hover:underline ml-1">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
