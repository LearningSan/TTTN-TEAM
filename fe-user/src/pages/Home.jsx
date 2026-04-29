import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter } from "react-icons/fa"; // Thêm FaFilter
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import axios from "axios";
import { Link } from "react-router-dom";
import CategoryNav from "../components/CategoryNav";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // --- LOGIC PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Tăng số lượng item mỗi trang

  const totalPages = Math.ceil(events.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = events.slice(indexOfFirstItem, indexOfLastItem);

  // Cập nhật hình ảnh banner mới (thay cho ảnh cũ)
  const sliderImages = [
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000",
  ];

  const fetchData = async (searchKeyword = "") => {
    setLoading(true);
    try {
      let endpoint = "";
      if (searchKeyword) {
        endpoint = `${import.meta.env.VITE_API_URL}/concert/search?keyword=${searchKeyword}&page=1&pageSize=200`;
      } else {
        endpoint = `${import.meta.env.VITE_API_URL}/concert?pageSize=200`;
      }

      const response = await axios.get(endpoint);

      if (response.data?.success) {
        const resData = response.data.data;
        const rawData = Array.isArray(resData) ? resData : resData?.items || [];

        // --- CẬP NHẬT LOGIC LỌC TẠI ĐÂY ---
        const activeEvents = rawData.filter((event, index, self) => {
          // 1. Chỉ lấy những concert có status là ON_SALE
          const isOnSale = event.status === "ON_SALE";

          // 2. Lọc unique concert_id (để không bị trùng card khi có nhiều zone)
          const isUnique =
            self.findIndex((t) => t.concert_id === event.concert_id) === index;

          return isOnSale && isUnique;
        });

        setEvents(activeEvents);
      }
    } catch (error) {
      console.error("Lỗi fetch data:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(searchTerm);
  };

  return (
    // Chuyển nền trang sang màu đen (giống image_a2333d.png)
    <div className="min-h-screen bg-[#111827] font-sans text-white">
      {/* Nav Section */}
      <CategoryNav />

      {/* Slider Section - Cập nhật theo image_a2335d.png */}
      <section className="bg-111827 py-12 relative overflow-hidden">
        <Swiper
          // Chuyển sang slider phẳng đơn giản
          slidesPerView={1}
          spaceBetween={30}
          loop={true}
          autoplay={{ delay: 5000 }}
          pagination={{ clickable: true, el: ".custom-pagination" }}
          navigation={{ nextEl: ".next-btn", prevEl: ".prev-btn" }}
          modules={[Pagination, Autoplay, Navigation]}
          className="max-w-7xl"
        >
          {sliderImages.map((img, index) => (
            <SwiperSlide key={index}>
              <div className="rounded-[20px] overflow-hidden shadow-2xl border border-gray-800">
                <img
                  src={img}
                  className="w-full h-[450px] object-cover"
                  alt="Event Banner"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="flex items-center justify-center gap-6 mt-8 relative z-20">
          <button className="prev-btn text-white/70 hover:text-white transition-colors cursor-pointer">
            <HiOutlineChevronLeft size={28} />
          </button>
          <div className="custom-pagination flex gap-2 !w-auto"></div>
          <button className="next-btn text-white/70 hover:text-white transition-colors cursor-pointer">
            <HiOutlineChevronRight size={28} />
          </button>
        </div>
      </section>

      {/* Search Bar Section - Cập nhật theo image_a2335d.png */}
      <section className="max-w-5xl mx-auto mt-12 mb-10 px-4 relative z-10">
        {/* Thêm shadow-[0_0_15px_rgba(255,45,149,0.5)] để tạo hiệu ứng Glow hồng bao quanh */}
        <div className="bg-[#E5E5E5] p-2 rounded-lg flex items-center gap-3 border border-[#FF2D95] shadow-[0_0_20px_2px_rgba(255,45,149,0.6)]">
          <div className="flex-1 flex items-center px-4">
            {/* Icon search nhỏ và đậm hơn */}
            <FaSearch className="text-black text-sm mr-4" />
            <input
              type="text"
              placeholder="Search Events"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              // Chỉnh text-black và font-bold
              className="bg-transparent w-full outline-none text-lg font-bold text-black placeholder:text-gray-700"
            />
          </div>

          <button
            onClick={handleSearch}
            // Nền hồng đậm, bo góc ít hơn (rounded-lg), chữ đen cực đậm (font-black)
            className="bg-[#FF2D95] text-black px-8 py-3 rounded-md text-xl font-black transition-all hover:bg-[#ff4fa7]"
          >
            Search
          </button>
        </div>
      </section>

      {/* Event List Section - Cập nhật thẻ mới theo image_a2333d.png */}
      <section className="max-w-6xl mx-auto py-10 px-6 space-y-8 relative z-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-[#FF2D95] border-t-transparent rounded-full mb-2"></div>
            <p className="font-bold text-gray-400">Loading Events...</p>
          </div>
        ) : currentItems.length > 0 ? (
          <>
            {currentItems.map((event) => (
              <div
                key={event.concert_id}
                // Viền hồng neon tỏa sáng (Glow effect)
                className="bg-[#1A1A1A] rounded-xl flex flex-col md:flex-row items-center p-5 border border-[#FF2D95]/30 shadow-[0_0_20px_rgba(255,45,149,0.4)] transition-all hover:scale-[1.01]"
              >
                {/* Hình ảnh banner */}
                <div className="w-full md:w-80 h-52 rounded-lg overflow-hidden shrink-0 shadow-2xl">
                  <img
                    src={
                      event.banner_url ||
                      `https://picsum.photos/seed/${event.concert_id}/600/400`
                    }
                    className="w-full h-full object-cover"
                    alt={event.title}
                  />
                </div>

                {/* Nội dung thông tin */}
                <div className="flex-1 px-8 py-4 text-center md:text-left">
                  <h4 className="text-2xl font-bold text-white mb-4 leading-tight tracking-tight">
                    {event.title}
                  </h4>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-lg font-medium italic">
                      {event.artist}
                    </p>
                    <p className="text-gray-500 text-base">
                      {event.city} | {event.venue_name}
                    </p>
                  </div>
                </div>

                {/* Nút Find Ticket kiểu Outline Xanh Neon */}
                <div className="w-full md:w-auto px-6">
                  <button
                    onClick={() => navigate(`/concert/${event.concert_id}`)}
                    className="border-2 border-[#00F0FF] text-[#00F0FF] px-6 py-2 rounded-lg text-sm font-black uppercase tracking-widest hover:bg-[#00F0FF] hover:text-black transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  >
                    Find Ticket
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-2 mt-12 mb-20">
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((prev) => prev - 1);
                  window.scrollTo({ top: 500, behavior: "smooth" });
                }}
                className="px-4 py-2 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg disabled:opacity-30 font-bold hover:bg-gray-800 transition-all"
              >
                Prev
              </button>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, index) => {
                  const p = index + 1;
                  if (
                    p === 1 ||
                    p === totalPages ||
                    (p >= currentPage - 1 && p <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setCurrentPage(p);
                          window.scrollTo({ top: 500, behavior: "smooth" });
                        }}
                        className={`w-10 h-10 rounded-lg font-bold transition-all ${
                          currentPage === p
                            ? "bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.6)]"
                            : "bg-[#1A1A1A] text-gray-400 border border-gray-800 hover:bg-gray-800"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((prev) => prev + 1);
                  window.scrollTo({ top: 500, behavior: "smooth" });
                }}
                className="px-4 py-2 bg-[#1A1A1A] text-white border border-gray-700 rounded-lg disabled:opacity-30 font-bold hover:bg-gray-800 transition-all"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-500 font-bold text-xl">
            No concerts found for "{searchTerm}".
          </div>
        )}
      </section>

      <style>{`
        /* Cập nhật style pagination của slider theo màu đỏ của UI */
        .custom-pagination .swiper-pagination-bullet { background: #fff !important; opacity: 0.5; width: 8px; height: 8px; }
        .custom-pagination .swiper-pagination-bullet-active { background: #FF2D95 !important; opacity: 1; transform: scale(1.3); }
      `}</style>
    </div>
  );
};

export default Home;
