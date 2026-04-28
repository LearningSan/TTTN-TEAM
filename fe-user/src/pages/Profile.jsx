import React, { useState, useEffect, useRef } from "react";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCamera,
  HiOutlineLink,
} from "react-icons/hi";
import { AiOutlineSave, AiOutlineEdit } from "react-icons/ai"; // Thêm icon Edit
import { IoWalletOutline } from "react-icons/io5";
import { ethers } from "ethers";
import axios from "axios";

const ProfilePage = () => {
  const [user, setUser] = useState({
    full_name: "",
    email: "",
    phone: "",
    wallet_address: "",
  });
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State để kiểm soát chế độ chỉnh sửa
  const apiUrl = import.meta.env.VITE_API_URL;
  const [selectedFile, setSelectedFile] = useState(null);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/personal-info`, {
          withCredentials: true,
        });
        // API trả về format: { success: true, data: { name: "...", email: "..." } }
        if (response.data && response.data.data) {
          const userData = response.data.data;
          setUser({
            full_name: userData.name || "Chưa cập nhật", // Lấy từ userData.name
            email: userData.email || "",
            phone: userData.phone || "",
          });
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };
    fetchUserData();
  }, [apiUrl]);
  // Hàm xử lý khi người dùng chọn file ảnh mới
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Tạo preview nhanh để người dùng thấy ngay
      const imageUrl = URL.createObjectURL(file);
      setUser((prev) => ({ ...prev, avatar_url: imageUrl }));
    }
  };
  // Hàm xử lý lưu thông tin (Gọi API Update)
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // Chuyển sang gửi JSON thay vì FormData vì API yêu cầu application/json
      const payload = {
        name: user.full_name,
        phone: user.phone,
        email: user.email,
        avatar_url: user.avatar_url, // Gửi URL (nếu có)
      };

      const response = await axios.post(
        `${apiUrl}/personal-info/update`,
        payload,
        {
          withCredentials: true,
        },
      );

      if (response.data) {
        alert("Cập nhật thông tin thành công!");
        setIsEditing(false);
        setSelectedFile(null); // Reset file sau khi lưu
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert(error.response?.data?.message || "Không thể lưu thông tin.");
    } finally {
      setLoading(false);
    }
  };
  // Hàm xử lý xác thực ví
  const handleVerifyWallet = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài đặt MetaMask!");
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      // 1. Lấy dữ liệu từ API Nonce
      const { data } = await axios.get(`${apiUrl}/wallet/nonce`, {
        withCredentials: true,
      });

      // 2. SỬA TẠI ĐÂY: Ký cái "message" chứ không ký cái "nonce"
      // Theo tài liệu API bạn gửi, trường này chứa thông điệp đầy đủ
      const messageToSign = data.message;
      const signature = await signer.signMessage(messageToSign);

      // 3. Gửi Verify lên server
      // Bạn nên gửi cả nonce và signature để backend đối chiếu
      const verifyRes = await axios.post(
        `${apiUrl}/wallet/verify`,
        {
          wallet_address: walletAddress, // Đảm bảo là string
          signature: signature, // Đảm bảo là string
          message: data.message, // Ép kiểu về Number để chắc chắn khớp API
        },
        { withCredentials: true },
      );
      if (verifyRes.data.success) {
        alert("Liên kết ví thành công!");

        setUser((prev) => ({
          ...prev,
          wallet_address: walletAddress, // Địa chỉ ví vừa ký xong
        }));
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert(error.response?.data?.message || "Xác thực thất bại. Thử lại sau!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0B1426] py-10 px-4 flex items-center justify-center font-sans text-white">
      <div className="w-full max-w-lg">
        {/* TIÊU ĐỀ */}
        <h2 className="text-3xl font-[900] text-center uppercase tracking-tighter mb-8 italic">
          Account Information
        </h2>

        {/* KHUNG CHÍNH */}
        <div className="bg-[#0F172A] rounded-2xl border border-[#00F2FF]/30 p-10 shadow-[0_0_20px_rgba(0,242,255,0.1)]">
          <div className="flex flex-col items-center">
            {/* HÀNG TRÊN: AVATAR VÀ CÁC INPUT */}
            <div className="flex flex-row w-full gap-8 items-start mb-10">
              <div className="relative mb-10">
                <div className="w-32 h-32 rounded-full bg-black flex items-center justify-center border border-gray-800 shadow-inner overflow-hidden">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      className="w-full h-full object-cover"
                      alt="Avatar"
                    />
                  ) : (
                    <HiOutlineUser size={70} className="text-gray-500/30" />
                  )}
                </div>

                {/* Nút bấm chỉnh sửa Avatar - Luôn hiện hoặc chỉ hiện khi isEditing */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-1 right-1 bg-[#7DE7EB] text-[#0B1426] p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
                >
                  <HiOutlineCamera size={20} />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              {/* CÁC TRƯỜNG NHẬP LIỆU */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-200">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user.full_name}
                    disabled={!isEditing} // Khóa khi không editing
                    onChange={(e) =>
                      setUser({ ...user, full_name: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-xl font-bold outline-none transition-all ${
                      isEditing
                        ? "bg-white text-black ring-2 ring-[#7DE7EB]"
                        : "bg-gray-800/50 text-gray-400 cursor-not-allowed"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-200">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled // Luôn khóa email vì thường không cho đổi
                    className="w-full px-4 py-2 rounded-xl bg-gray-800/50 text-gray-500 font-bold outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-200">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={user.phone}
                    disabled={!isEditing} // Khóa khi không editing
                    onChange={(e) =>
                      setUser({ ...user, phone: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-xl font-bold outline-none transition-all ${
                      isEditing
                        ? "bg-white text-black ring-2 ring-[#7DE7EB]"
                        : "bg-gray-800/50 text-gray-400 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* LOGIC CHUYỂN ĐỔI NÚT */}
            <div className="flex gap-4">
              {!isEditing ? (
                // NÚT EDIT: Hiện khi đang ở chế độ xem
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-48 bg-white/10 border border-[#7DE7EB] hover:bg-[#7DE7EB] hover:text-[#0B1426] text-[#7DE7EB] py-3 rounded-xl font-[900] uppercase tracking-widest text-sm transition-all"
                >
                  Edit Profile
                </button>
              ) : (
                // CẶP NÚT UPDATE & CANCEL: Hiện khi đang sửa
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-[900] uppercase tracking-widest text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={loading}
                    className="w-48 bg-[#7DE7EB] hover:bg-[#5bc8cc] text-[#0B1426] py-3 rounded-xl font-[900] uppercase tracking-widest text-sm shadow-[0_4px_15px_rgba(125,231,235,0.3)] active:scale-95 transition-all"
                  >
                    {loading ? "Updating..." : "Update Info"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
