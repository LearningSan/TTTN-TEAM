import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectCoverflow,
  Pagination,
  Autoplay,
  Navigation,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Link, useNavigate } from "react-router-dom";
import { GiTicket } from "react-icons/gi";
import { FaUserCircle, FaSearch } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import axios from "axios";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const sliderImages = [
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000",
  ];

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/concert`,
        );
        if (response.data?.success) {
          const uniqueEvents = response.data.data.filter(
            (v, i, a) =>
              a.findIndex((t) => t.concert_id === v.concert_id) === i,
          );
          setEvents(uniqueEvents);
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Lớp nền đỏ nhạt lan tỏa ở dưới cùng */}
      <div
        className="fixed bottom-0 left-0 w-full h-[60%] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(141, 27, 27, 0.4) 0%, rgba(255, 255, 255, 0) 100%)",
          zIndex: 0,
        }}
      />
      <nav className="bg-white py-3 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-start gap-16 text-[16px] font-black uppercase tracking-tight px-12">
          <a
            href="#"
            className="text-[#8D1B1B] hover:opacity-70 transition-opacity"
          >
            Theatre & Arts
          </a>
          <a
            href="#"
            className="text-[#8D1B1B] hover:opacity-70 transition-opacity"
          >
            Sports
          </a>
          <a
            href="#"
            className="text-[#8D1B1B] hover:opacity-70 transition-opacity"
          >
            Seminars & Workshops
          </a>
          <a
            href="#"
            className="text-[#8D1B1B] hover:opacity-70 transition-opacity"
          >
            Resale ticket
          </a>
        </div>
      </nav>

      {/* 2. Banner Slider - Chỉnh sửa tỉ lệ hình chữ nhật đứng */}
      <section className="bg-gradient-to-b from-[#8D1B1B] to-[#0A0000] py-12 relative overflow-hidden">
        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1.8}
          loop={true}
          autoplay={{ delay: 10000 }}
          coverflowEffect={{
            rotate: 0,
            stretch: -50,
            depth: 150,
            modifier: 1,
            slideShadows: false,
          }}
          pagination={{ clickable: true, el: ".custom-pagination" }}
          navigation={{ nextEl: ".next-btn", prevEl: ".prev-btn" }}
          modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
          className="max-w-7xl"
        >
          {sliderImages.map((img, index) => (
            <SwiperSlide key={index}>
              {({ isActive }) => (
                <div
                  className={`transition-all duration-500 rounded-[35px] overflow-hidden shadow-2xl border-2 border-white/5 
                  ${isActive ? "opacity-100 scale-105" : "opacity-40 scale-90 grayscale-[0.5]"}`}
                >
                  <img
                    src={img}
                    className="w-full h-[450px] object-cover"
                    alt="Event"
                  />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Nút điều khiển - Trắng tinh khôi */}
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

      {/* Section Search Bar */}
      <section className="max-w-5xl mx-auto mt-12 mb-10 px-4">
        <div className="bg-[#F9EAEA] p-3 rounded-md shadow-sm border border-[#8D1B1B]/30 flex items-center gap-3">
          <div className="flex-1 flex items-center px-4">
            <FaSearch className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search Events"
              className="bg-transparent w-full outline-none text-sm font-semibold text-gray-700"
            />
          </div>
          <button className="bg-[#8D1B1B] text-white px-10 py-2 rounded-md text-sm font-bold shadow-md hover:bg-black transition-all">
            Search
          </button>
        </div>
      </section>

      {/* Section Event List */}
      <section className="max-w-5xl mx-auto py-16 px-6 space-y-12">
        {loading ? (
          <div className="text-center font-bold">Loading...</div>
        ) : (
          events.map((event) => (
            <div
              key={event.concert_id}
              className="bg-[#F7F7E8] rounded-xl flex flex-col md:flex-row items-center p-6 
                   shadow-[0_0_20px_rgba(255,223,137,0.5)] border-y-4 border-orange-100/30
                   relative transition-transform hover:scale-[1.02]"
            >
              {/* Ảnh Concert */}
              <div className="w-full md:w-80 h-52 rounded-xl overflow-hidden shrink-0 shadow-lg">
                <img
                  src={
                    event.banner_url || "https://placehold.co/600x400?text=Ảnh"
                  }
                  className="w-full h-full object-cover"
                  alt={event.title}
                />
              </div>

              {/* Thông tin */}
              <div className="flex-1 px-10 py-4 text-center md:text-left">
                <h4 className="text-xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
                  {event.title}
                </h4>
                <p className="text-gray-800 font-bold text-base">
                  {event.location ||
                    "Bangkok | Impact Arena, Muang Thong Thani"}
                </p>
              </div>

              {/* Nút Find Ticket - Thêm onClick để chuyển trang */}
              <button
                onClick={() => navigate(`/concert/${event.concert_id}`)}
                className="absolute top-6 right-6 md:static bg-[#8D1B1B] text-white 
                     px-5 py-2 text-sm font-black rounded-xl uppercase 
                     border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                     hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                FIND TICKET
              </button>
            </div>
          ))
        )}
      </section>

      {/* Style tùy chỉnh cho Swiper dots */}
      <style>{`
        .custom-pagination .swiper-pagination-bullet { background: #888 !important; opacity: 0.5; width: 8px; height: 8px; margin: 0 4px !important; }
        .custom-pagination .swiper-pagination-bullet-active { background: #7C4DFF !important; opacity: 1; transform: scale(1.2); }
      `}</style>
    </div>
  );
};

export default Home;
