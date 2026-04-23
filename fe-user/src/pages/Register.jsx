import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { HiOutlineMail, HiOutlineUser } from "react-icons/hi";
import { RiEyeOffLine, RiEyeLine, RiLockPasswordLine } from "react-icons/ri";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    Name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  // 1. Cập nhật Regex: Ít nhất 8 ký tự, có chữ hoa, thường và số
  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pass);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); // Reset thông báo lỗi cũ

    // 1. Kiểm tra độ dài Tên (2 - 50 ký tự)
    if (formData.Name.length < 2 || formData.Name.length > 50) {
      setError("Họ tên phải từ 2 đến 50 ký tự!");
      return;
    }

    // 2. Kiểm tra định dạng Email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email không đúng định dạng (ví dụ: example@gmail.com)!");
      return;
    }

    // 3. Kiểm tra mật khẩu (đã làm ở bước trước)
    if (!validatePassword(formData.password)) {
      setError(
        "Mật khẩu phải từ 8 ký tự trở lên, gồm chữ hoa, chữ thường và số!",
      );
      return;
    }

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
      // Hiển thị thông báo lỗi trực tiếp từ Server nếu có
      if (error.response?.data?.message === "User already exists") {
        setError(<span>Email này đã tồn tại.</span>);
      } else {
        setError(error.response?.data?.message || "Đăng ký thất bại!");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-white font-sans"
    >
      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Hiệu ứng nền đỏ mờ đồng bộ với Login */}
        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#8D1B1B] to-transparent opacity-80" />

        <div className="z-10 w-full max-auto flex justify-center">
          {/* Box chính với viền xanh #31A1EE giống Login */}
          <div className="bg-white w-[450px] border-[3px] border-[#31A1EE] rounded-[40px] p-10 shadow-xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#444] mb-2 uppercase tracking-tight">
                Create Account
              </h2>
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-500 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              {/* Full Name Field */}
              <div className="text-left">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-11 pr-5 py-3 border border-gray-400 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={formData.Name}
                    onChange={(e) =>
                      setFormData({ ...formData, Name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="text-left">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    className="w-full pl-11 pr-5 py-3 border border-gray-400 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="text-left">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <RiLockPasswordLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 border border-gray-400 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
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
                {/* Dòng nhắc nhở cập nhật lên 8 ký tự */}
                <p className="text-[12px] text-red-500 mt-2 ml-4 italic">
                  * Phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.
                </p>
              </div>

              {/* Phần hiển thị thông báo lỗi */}
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl py-3 px-4 mb-4 transition-all">
                  <p className="text-red-600 text-[13px] font-black text-center leading-tight">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#7A2121] text-white font-bold rounded-full text-lg shadow-lg hover:bg-[#5a1818] transition-all uppercase mt-2"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default Register;
