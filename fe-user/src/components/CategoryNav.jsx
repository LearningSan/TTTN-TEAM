import React from "react";
import { Link, useLocation } from "react-router-dom";

const CategoryNav = () => {
  const location = useLocation();

  const navItems = [
    {
      name: "Theatre & Arts",
      color: "bg-[#FF2D95]",
      shadow: "shadow-[0_0_10px_#FF2D95]",
      path: "/",
    },
    {
      name: "Sports",
      color: "bg-[#00E5FF]",
      shadow: "shadow-[0_0_10px_#00E5FF]",
      path: "#",
    },
    {
      name: "My Purchases",
      color: "bg-[#FF2D95]",
      shadow: "shadow-[0_0_10px_#FF2D95]",
      path: "/my-purchases",
    },
    {
      name: "Resale Ticket",
      color: "bg-[#00E5FF]",
      shadow: "shadow-[0_0_10px_#00E5FF]",
      path: "/resale-market",
    },
  ];

  return (
    <nav className="bg-[#0A0A0A] py-6 border-b border-gray-900 relative z-10 w-full font-sans antialiased">
      <div className="max-w-7xl mx-auto flex justify-start gap-12 text-[18px] font-black uppercase tracking-tighter px-12 items-end overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <div
              key={item.name}
              className="flex flex-col items-center group cursor-pointer shrink-0"
            >
              <Link
                to={item.path}
                className="text-white hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                {item.name}
              </Link>

              {/* Thanh line neon phía dưới - Giữ màu theo item */}
              <div
                className={`h-[3px] w-full mt-2 ${item.color} ${item.shadow} transition-transform duration-300 group-hover:scale-x-110 ${
                  isActive ? "scale-x-110" : "scale-x-100"
                }`}
              ></div>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default CategoryNav;
