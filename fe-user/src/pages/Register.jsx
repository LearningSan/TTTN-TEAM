import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { HiOutlineChevronDown } from "react-icons/hi";
import { AiFillHome } from "react-icons/ai";
import { RiEyeOffLine, RiEyeLine } from "react-icons/ri";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    Name: "",
    email: "",
    password: "",
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/signup`,
        {
          email: formData.email,
          password: formData.password,
          name: formData.Name,
        },
      );

      if (response.status === 201 || response.status === 200) {
        alert("Đăng ký thành công!");
        navigate("/login");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Đăng ký thất bại!";
      alert(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Header đồng bộ */}
      <header className="bg-white text-[#4A5568] py-4 px-12 flex items-center justify-between border-b border-gray-100 shadow-sm z-20">
        <div className="flex items-center">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-3xl font-black tracking-tighter text-[#8D1B1B]">
              TICKETX
            </h1>
          </Link>
        </div>
        <nav className="flex items-center gap-10 text-sm font-medium">
          <a href="#" className="hover:text-black">
            Help
          </a>
          <a href="#" className="hover:text-black">
            Contact us
          </a>
          <div className="flex items-center gap-1 cursor-pointer hover:text-black">
            <span>English</span>
            <HiOutlineChevronDown size={16} />
          </div>
          <Link
            to="/login"
            className="ml-4 hover:text-black border-l pl-10 border-gray-300"
          >
            Sign In
          </Link>
          <Link to="/" className="text-[#2D3748] hover:text-black">
            <AiFillHome size={22} />
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Hiệu ứng nền đỏ mờ phía dưới */}
        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#8D1B1B] to-transparent opacity-80" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="z-10 w-full max-w-[480px] bg-white border-[3px] border-[#F2D1D1] rounded-[40px] p-10 shadow-xl"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2 uppercase tracking-tight">
              Sign up
            </h2>
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            {/* Name */}
            <div className="text-left">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Your name..."
                className="w-full px-5 py-3 border border-[#8D1B1B]/40 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-100"
                value={formData.Name}
                onChange={(e) =>
                  setFormData({ ...formData, Name: e.target.value })
                }
                required
              />
            </div>

            {/* Email */}
            <div className="text-left">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                Email
              </label>
              <input
                type="email"
                placeholder="deniel123@gmail.com"
                className="w-full px-5 py-3 border border-[#8D1B1B]/40 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-100"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            {/* Password */}
            <div className="text-left">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  className="w-full px-5 py-3 border border-[#8D1B1B]/40 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-100"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <div
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
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

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 bg-[#7A2121] text-white font-bold rounded-full text-xl shadow-lg hover:bg-[#5a1818] transition-all"
              >
                Sign Up
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default Register;
