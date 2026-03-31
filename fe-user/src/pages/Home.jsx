import React, { useState, useEffect } from "react"; // Thêm useState và useEffect
import { Link, useNavigate } from "react-router-dom";
import { GiTicket } from "react-icons/gi";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios"; // Import axios để gọi API

const Home = () => {
  // 1. Khai báo state để lưu danh sách sự kiện từ API
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Trạng thái chờ dữ liệu
  const navigate = useNavigate();

  // 2. useEffect để gọi API khi component được gắn (mount)
  useEffect(() => {
    const fetchUserData = async () => {
      // 1. Thử lấy từ localStorage trước (cho Login thường)
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        return;
      }

      // 2. Gọi API
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/me`, {
          withCredentials: true,
        });

        // Backend trả về: { success: true, data: user }
        if (res.data && res.data.success && res.data.data) {
          const userData = res.data.data; // Đây chính là thông tin user
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (err) {
        console.log("Lỗi khi lấy thông tin user:", err);
        console.log("Chưa đăng nhập hoặc Session hết hạn");
      }
    };

    const fetchEvents = async () => {
      try {
        setLoading(true); // Bắt đầu tải: Hiển thị thông báo Loading
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/events`,
        );
        setEvents(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sự kiện:", error);
      } finally {
        setLoading(false); // Kết thúc tải: Tắt thông báo Loading để hiện data
      }
    };

    fetchUserData();
    fetchEvents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-[#05070A] text-white font-sans">
      {/* Header & Navigation */}
      <header className="bg-black border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-3xl font-black tracking-tighter text-[#8D1B1B]">
            TICKETX
          </h1>
          <div className="flex items-center gap-8 font-bold text-sm">
            <Link
              to="/my-tickets"
              className="flex items-center gap-1 hover:text-gray-400"
            >
              <GiTicket className="text-xl" /> My ticket
            </Link>

            {/* KIỂM TRA ĐĂNG NHẬP TẠI ĐÂY */}
            {user ? (
              <div className="flex items-center gap-4 group relative">
                <div className="flex items-center gap-2 cursor-pointer text-[#AC72A1]">
                  <FaUserCircle className="text-xl" />
                  <span>{user.display_name || user.name || user.email}</span>
                </div>

                {/* Nút Logout hiện ra khi hover (hoặc bạn có thể làm menu dropdown) */}
                <button
                  onClick={handleLogout}
                  className="ml-2 text-[10px] bg-red-900/50 px-2 py-1 rounded hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="hover:text-gray-400">
                Sign in/ /Register
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Điều hướng */}
      <nav className="bg-[#8D1B1B] py-3">
        <div className="max-w-7xl mx-auto flex justify-center gap-12 text-sm font-bold uppercase tracking-wide">
          <a href="#" className="hover:underline">
            Theatre & Arts
          </a>
          <a href="#" className="hover:underline">
            Sports
          </a>
          <a href="#" className="hover:underline">
            Seminars & Workshops
          </a>
          <a href="#" className="hover:underline">
            Resale ticket
          </a>
        </div>
      </nav>

      {/* Banner */}
      <section className="relative h-[600px] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1500" // Ảnh Taylor Swift mẫu
          alt="Featured Event"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-transparent to-transparent" />
      </section>

      {/* Filter Section */}
      <section className="max-w-5xl mx-auto -mt-20 relative z-10 p-8 text-center">
        <h2 className="text-3xl font-black italic mb-8 uppercase">
          What's happening in Vietnam?
        </h2>
        <div className="flex flex-wrap justify-center items-end gap-4 bg-black/40 backdrop-blur-md p-6 rounded-lg">
          <div className="text-left">
            <label className="block text-[10px] font-bold mb-1 uppercase">
              Locations
            </label>
            <select className="bg-white text-black text-xs px-4 py-2 w-48 rounded-sm outline-none">
              <option>Select Value</option>
            </select>
          </div>
          <div className="text-left">
            <label className="block text-[10px] font-bold mb-1 uppercase">
              Start -&gt; End Date
            </label>
            <input
              type="text"
              placeholder="Start date -> End date"
              className="bg-white text-black text-xs px-4 py-2 w-48 rounded-sm outline-none"
            />
          </div>
          <button className="bg-[#8D1B1B] px-8 py-2 text-xs font-bold uppercase hover:bg-red-700 transition-all">
            Find Events
          </button>
        </div>
      </section>

      {/* Trending Section (Pink Cards) */}
      <section className="max-w-6xl mx-auto py-12 px-4 flex justify-center gap-8">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="relative w-80 h-80 rounded-3xl overflow-hidden group cursor-pointer shadow-[0_0_20px_rgba(233,30,99,0.3)]"
          >
            <img
              src="https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=500"
              className="w-full h-full object-cover"
              alt="Trending"
            />
            <div className="absolute inset-0 bg-[#AC72A1]/40 mix-blend-multiply" />
            <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-white/20 m-4 rounded-2xl">
              <span className="text-5xl font-black tracking-widest opacity-80">
                BUILD 2.0
              </span>
              <span className="mt-4 font-bold tracking-widest">
                ANDREA MARQUEZ
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Danh sách sự kiện THỰC TẾ */}
      <section className="max-w-5xl mx-auto py-12 px-4">
        <h3 className="text-4xl font-black italic text-center mb-12 uppercase">
          Events
        </h3>

        {loading ? (
          <div className="text-center py-10">Đang tải sự kiện...</div>
        ) : events.length > 0 ? (
          <div className="space-y-6">
            {events.map((event) => (
              <div
                key={event.id || event._id} // Đảm bảo key duy nhất
                className="flex flex-col md:flex-row items-center bg-gradient-to-r from-black via-[#421010] to-[#8D1B1B] rounded-sm overflow-hidden p-6 border-l-4 border-red-600 shadow-xl"
              >
                {/* Sử dụng URL ảnh từ API hoặc ảnh mặc định nếu không có */}
                <img
                  src={event.image || "https://via.placeholder.com/300x200"}
                  className="w-full md:w-64 h-40 object-cover rounded-md"
                  alt={event.title}
                />
                <div className="flex-1 px-8 py-4">
                  <h4 className="text-xl font-bold mb-2 uppercase">
                    {event.title || event.name}
                  </h4>
                  <p className="text-gray-300 text-sm">
                    {event.location || event.address}
                  </p>
                </div>
                <button className="px-6 py-2 border-2 border-black bg-transparent hover:bg-black transition-all font-bold text-xs uppercase">
                  Find Ticket
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            Không có sự kiện nào diễn ra.
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-black py-20 mt-12 border-t border-gray-900">
        <div className="text-center text-gray-600 text-xs">
          © 2026 TICKETX. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
