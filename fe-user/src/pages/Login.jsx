import React, { useState, useEffect } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { RiLockPasswordLine, RiEyeOffLine, RiEyeLine } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom"; // Thêm Link và useNavigate để điều hướng
import axios from "axios"; // Import axios để gọi API
import { motion } from "framer-motion"; // Thêm import motion từ framer-motion
import { HiOutlineChevronDown } from "react-icons/hi"; // Icon mũi tên cho phần ngôn ngữ
import { AiFillHome } from "react-icons/ai"; // Icon Home

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

      // Sửa đoạn code trong image_c05f7a.png của bạn
      // Trong file Login.jsx, đoạn xử lý Google Login
      // TRONG FILE Login.jsx
      if (event.data === "LOGIN_SUCCESS") {
        axios
          .get(`${import.meta.env.VITE_API_URL}/me`, { withCredentials: true })
          .then((response) => {
            // SỬA TẠI ĐÂY: Vì API trả về user trực tiếp, không bọc trong trường .data nữa
            const userData = response.data;

            if (userData && userData.user_id) {
              localStorage.setItem("user", JSON.stringify(userData));
              window.dispatchEvent(new Event("storage"));
              window.location.href = "/"; // Chuyển hướng ngay
            }
          })
          .catch((err) => {
            console.error("Lỗi:", err);
            window.location.href = "/";
          });
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
  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    return regex.test(pass);
  };
  // 4. Hàm xử lý Login thông thường
  const handleLogin = async (e) => {
    e.preventDefault();
    // Kiểm tra định dạng mật khẩu trước khi gọi API
    if (!validatePassword(password)) {
      alert("Mật khẩu phải bao gồm chữ hoa, chữ thường và số!");
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          email: email,
          password: password,
          // deviceInfo: navigator.userAgent, // Bạn có thể bỏ dòng này nếu Backend không cần
        },
        { withCredentials: true },
      );

      // Trong handleLogin
      if (response.data && (response.data.user_id || response.data.email)) {
        const userData = response.data; // Giả sử API login cũng trả về Object user trực tiếp
        localStorage.setItem("user", JSON.stringify(userData));

        // QUAN TRỌNG: Kích hoạt sự kiện để MainLayout nhận diện tên ngay lập tức
        window.dispatchEvent(new Event("storage"));

        alert("Đăng nhập thành công!");
        navigate("/");
      }
    } catch (error) {
      const serverMessage = error.response?.data?.message || "Lỗi hệ thống!";
      alert(serverMessage);
      console.error("Login error:", error);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col bg-[#101114] font-sans"
    >
      <main className="flex-1 flex items-center justify-center bg-white p-4 relative overflow-hidden">
        {/* Hiệu ứng nền đỏ mờ ở phía dưới như trong ảnh */}
        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#8D1B1B] to-transparent opacity-80" />

        <div className="z-10 w-full max-auto flex justify-center">
          {/* Box chính với viền xanh */}
          <div className="bg-white w-[450px] border-[3px] border-[#31A1EE] rounded-[40px] p-10 shadow-xl">
            {/* Header text */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#444] mb-2 uppercase tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-500 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Email Field */}
              <div className="text-left">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="deniel123@gmail.com......"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-3 border border-gray-400 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Password Field */}
              <div className="text-left">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-5 py-3 border border-gray-400 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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

              {/* Remember me & Forgot Pass */}
              <div className="flex justify-between items-center px-1 text-xs font-medium text-gray-500">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-blue-500" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="hover:text-blue-600">
                  Forget password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#7A2121] text-white font-bold rounded-full text-lg shadow-lg hover:bg-[#5a1818] transition-all"
              >
                Sign In
              </button>

              {/* Divider */}
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs">
                  or continue with
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Social Buttons */}
              <div className="flex gap-10 justify-center">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="p-3 border border-blue-400 rounded-xl hover:bg-gray-50"
                >
                  <FcGoogle size={30} />
                </button>
                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  className="p-3 border border-blue-400 rounded-xl hover:bg-gray-50"
                >
                  <FaFacebook size={30} className="text-[#1877F2]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      {/* </div> */}
    </motion.div>
  );
};

export default Login;
