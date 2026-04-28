import React, { useState, useEffect } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { RiLockPasswordLine, RiEyeOffLine, RiEyeLine } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { HiOutlineChevronDown } from "react-icons/hi";
import { AiFillHome } from "react-icons/ai";
import { useSearchParams } from "react-router-dom";

const Login = () => {
  // 1. Khai báo State để lưu thông tin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const verified = searchParams.get("verified");
  const error = searchParams.get("error");

  useEffect(() => {
    if (verified === "true") {
      alert("Xác thực email thành công! Bây giờ bạn có thể đăng nhập.");
    }
    if (error) {
      alert("Lỗi xác thực: " + error);
    }
  }, [verified, error]);

  useEffect(() => {
    // Lấy origin từ .env, nếu không có thì lấy từ API URL nhưng cắt bỏ phần /api
    const rawOrigin =
      import.meta.env.VITE_SERVER_ORIGIN ||
      import.meta.env.VITE_API_URL?.replace("/api", "");

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
      const response = await axios({
        method: "post",
        url: `${import.meta.env.VITE_API_URL}/login`,
        data: {
          email: email,
          password: password,
        },
        withCredentials: true,
        // CHỈ để lại Content-Type, không thêm bất kỳ header nào khác
        headers: {
          "Content-Type": "application/json",
        },
      });

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
      className="min-h-screen flex flex-col bg-white font-sans relative overflow-hidden"
    >
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
        {/* KHUNG VIỀN GRADIENT: Giảm padding xuống 1px để viền thanh mảnh hơn */}
        <div className="relative p-[3px] rounded-[40px] bg-gradient-to-r from-[#FF2D95] to-[#00E5FF] overflow-hidden">
          <div className="bg-white w-[400px] rounded-[39px] p-10 flex flex-col items-start">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-wider">
              WELCOME BACK!
            </h1>
            <p className="text-xm text-gray-400 mb-8 font-medium">
              Don't have an account,{" "}
              <Link to="/register" className="text-blue-400 hover:underline">
                Sign up
              </Link>
            </p>

            <form className="w-full space-y-5" onSubmit={handleLogin}>
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xm font-semibold font-['Nunito'] ml-2 tracking-wider">
                  Email
                </label>
                <div className="p-[1px] rounded-full bg-gradient-to-r from-[#FF2D95] to-[#00E5FF]">
                  <input
                    type="email"
                    placeholder="deniel123@gmail.com......."
                    className="w-full px-6 py-3 rounded-full bg-white outline-none text-sm text-gray-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password với viền Gradient */}
              <div className="space-y-2">
                <label className="text-xm font-semibold font-['Nunito'] ml-2 tracking-wider">
                  Password
                </label>
                <div className="p-px rounded-full bg-linear-to-r from-[#FF2D95] to-[#00E5FF]">
                  <div className="relative bg-white rounded-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      className="w-full px-6 py-3 rounded-full bg-transparent outline-none text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

              {/* Remember & Forgot */}
              <div className="flex justify-between items-center px-2 text-[11px] text-gray-500 font-semibold">
                <label className="flex items-center gap-2 cursor-pointer group">
                  {/* 1. Input vẫn là peer */}
                  <input type="checkbox" className="sr-only peer" />

                  {/* 2. Vòng tròn ngoài: Ta thêm class: peer-checked:[&_div]:opacity-100 
                    Nghĩa là: Khi peer được check, tìm thẻ div bên trong và cho nó hiện lên.*/}
                  <div
                    className="
                      w-6 h-6 rounded-full border-2 border-blue-200 
                      flex items-center justify-center 
                      transition-all duration-200
                    peer-checked:border-blue-400 peer-checked:bg-blue-50
                      peer-checked:[&_div]:opacity-100 peer-checked:[&_div]:scale-100
                      "
                  >
                    {/* 3. Chấm tròn nhỏ: Bỏ hoàn toàn peer-checked ở đây để tránh xung đột. */}
                    <div
                      className="
                        w-3 h-3 rounded-full bg-blue-500
                        opacity-0 scale-0
                        transition-all duration-200
                        "
                    />
                  </div>

                  <span className="hover:text-gray-800 select-none">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  size={18}
                  className="hover:text-gray-800"
                >
                  Forget password?
                </Link>
              </div>

              {/* Button Sign In */}
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
                Sign In
              </button>

              {/* Or continue with */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                  or continue with
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Social Buttons */}
              <div className="flex gap-4 w-full">
                <button
                  onClick={handleGoogleLogin}
                  type="button"
                  className="flex-1 py-3 border border-blue-400 rounded-xl flex justify-center items-center hover:bg-gray-200"
                >
                  <FcGoogle size={24} />
                </button>
                <div className="flex-1 py-3 rounded-xl flex justify-center items-center"></div>
                <button
                  onClick={handleFacebookLogin}
                  type="button"
                  className="flex-1 py-3 border border-blue-400 rounded-xl flex justify-center items-center hover:bg-gray-200"
                >
                  <FaFacebook size={24} className="text-[#1877F2]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default Login;
