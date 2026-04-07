import React from "react";

const LoginButton = () => {
  return (
    <div className="flex p-10 bg-[#b8a9bc] justify-center items-center">
      <button
        className="
          /* 1. KÍCH THƯỚC & HÌNH DẠNG */
          px-16 py-3
          min-w-[300px]
          rounded-full 
          
         /* 2. GRADIENT ĐÚNG TÔNG MẪU (Từ trên xuống) */
          bg-gradient-to-b
          
          /* Màu trên: Tím trầm (AC72A1) */
          from-[#AC72A1] 
          
          /* Màu dưới: Xanh tím sâu (363371) - Đủ đậm nhưng không bị đen */
          to-[#363371]
          
          /* 3. FONT CHỮ TRỰC TIẾP (Không dùng @theme) */
          /* Nếu muốn dùng Anton: font-['Anton'] */
          /* Để giống mẫu nhất (chữ i có chấm), nên dùng font mặc định dày của hệ thống hoặc Impact */
          font-['Impact',_sans-serif] 
          
          /* 4. ĐỘ DÀY VÀ KÍCH THƯỚC */
          text-[40px]      /* Chỉnh kích thước chính xác bằng px */
          font-light        /* Nét chữ đậm */
          text-white 
          
          /* 5. TINH CHỈNH ĐỘ KHÍT (Quan trọng để giống mẫu) */
          tracking-[-0.001em] /* Làm các chữ sát khít nhau hơn */
          leading-none       /* Loại bỏ khoảng cách dòng thừa */
          
          /* 6. HIỆU ỨNG */
          hover:opacity-90
          transition-all
          cursor-pointer
          shadow-xl
        "
      >
        {/* Viết đúng: L hoa, ogin thường */}
        Login
      </button>
    </div>
  );
};

export default LoginButton;
