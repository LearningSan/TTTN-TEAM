import React, { useState, useEffect } from "react";
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

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State để kiểm soát chế độ chỉnh sửa
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/me`, {
          withCredentials: true,
        });
        if (response.data) {
          setUser({
            full_name: response.data.name || "Chưa cập nhật",
            email: response.data.email || "",
            phone: response.data.phone || "",
            wallet_address:
              response.data.wallet_address ||
              response.data.walletAddress ||
              "Chưa liên kết",
          });
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };
    fetchUserData();
  }, [apiUrl]);

  // Hàm xử lý lưu thông tin (Gọi API Update)
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/update/personal-info`,
        {
          full_name: user.full_name,
          phone: user.phone,
        },
        { withCredentials: true },
      );

      if (response.data) {
        alert("Cập nhật thông tin thành công!");
        setIsEditing(false); // Tắt chế độ chỉnh sửa sau khi lưu
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Không thể lưu thông tin.");
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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="md:flex">
          {/* SIDEBAR BÊN TRÁI - PHẦN AVATAR ĐÃ QUAY TRỞ LẠI */}
          <div className="md:w-1/3 bg-[#8D1B1B] p-8 text-white flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-white/30 overflow-hidden bg-white/10 flex items-center justify-center">
                <HiOutlineUser size={64} className="text-white/50" />
              </div>
              <button className="absolute bottom-0 right-0 bg-white text-[#8D1B1B] p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                <HiOutlineCamera size={20} />
              </button>
            </div>
            <h3 className="text-xl font-black uppercase tracking-wider mb-1 text-center">
              {user.full_name}
            </h3>
            <p className="text-white/70 text-sm mb-8 font-medium italic">
              Thành viên
            </p>

            <div className="w-full space-y-3">
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl flex items-center gap-3 px-4 transition-all font-bold text-xs uppercase tracking-widest">
                <HiOutlineUser size={18} /> Thông tin chung
              </button>
              {/* <button className="w-full py-3 hover:bg-white/10 rounded-xl flex items-center gap-3 px-4 transition-all font-bold text-xs uppercase tracking-widest opacity-60">
                <HiOutlineLink size={18} /> Lịch sử mua vé
              </button> */}
            </div>
          </div>

          {/* NỘI DUNG BÊN PHẢI */}
          <div className="md:w-2/3 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">
                Hồ sơ cá nhân
              </h2>
              {/* {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors"
                >
                  <AiOutlineEdit size={20} /> Chỉnh sửa
                </button>
              )} */}
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                  Họ và tên
                </label>
                <div className="relative">
                  <HiOutlineUser
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={user.full_name}
                    onChange={(e) =>
                      setUser({ ...user, full_name: e.target.value })
                    }
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all border-2 ${
                      isEditing
                        ? "border-blue-200 bg-white focus:border-[#8D1B1B]"
                        : "border-transparent bg-gray-50"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                  Email
                </label>
                <div className="relative">
                  <HiOutlineMail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-12 pr-4 py-4 bg-gray-100 border-2 border-transparent rounded-2xl cursor-not-allowed text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                  Số điện thoại
                </label>
                <div className="relative">
                  <HiOutlinePhone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={user.phone}
                    onChange={(e) =>
                      setUser({ ...user, phone: e.target.value })
                    }
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all border-2 ${
                      isEditing
                        ? "border-blue-200 bg-white focus:border-[#8D1B1B]"
                        : "border-transparent bg-gray-50"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                  Ví Web3 liên kết
                </label>
                <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-[#8D1B1B]">
                      <IoWalletOutline size={24} />
                    </div>
                    <p className="text-sm font-mono text-gray-600 truncate">
                      {user.wallet_address}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyWallet}
                    className="text-[10px] font-black uppercase bg-[#8D1B1B] hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all"
                  >
                    {user.wallet_address !== "Chưa liên kết"
                      ? "Đổi ví"
                      : "Liên kết"}
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={loading}
                    className="flex-1 bg-[#8D1B1B] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:bg-red-700 shadow-lg active:scale-95 transition-all"
                  >
                    <AiOutlineSave size={20} />
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-8 bg-gray-200 text-gray-700 rounded-2xl font-bold uppercase text-xs hover:bg-gray-300 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
