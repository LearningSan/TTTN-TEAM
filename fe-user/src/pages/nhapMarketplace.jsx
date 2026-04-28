import React, { useEffect, useState } from "react";

const Marketplace = () => {
  const [orders, setOrders] = useState([]); // Đổi tên thành orders cho đúng bản chất
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/ticket?status=TRANSFERRED&page=1");
        const json = await response.json();

        // SỬA TẠI ĐÂY: Truy cập vào json.data.data
        if (json.data && json.data.data) {
          setOrders(json.data.data);
        }
      } catch (error) {
        console.error("Lỗi fetch API:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Đang tải danh sách vé...</div>;

  const handleBuyTicket = async (ticketId) => {
    try {
      const res = await fetch("/api/resale/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: ticketId }), // Gửi ID của vé Jazz Night
      });

      const data = await res.json();
      if (res.ok) {
        // Chuyển hướng và truyền dữ liệu giao dịch sang trang xác nhận
        // Bạn có thể dùng React Router hoặc chuyển hướng bằng URL
        window.location.href = `/resale-confirm/${data.transfer_id}`;
      }

      // LƯU Ý QUAN TRỌNG:
      // Bạn cần lưu 'data' này lại (transfer_id, contract_address...) [cite: 10]
      // Cách tốt nhất là chuyển hướng sang một trang mới gọi là "Trang Giao Dịch"
      // kèm theo ID vừa nhận được.
      window.location.href = `/transaction/${data.transfer_id}`;
    } catch (err) {
      alert("Không thể kết nối API");
    }
  };
  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{ marginBottom: "30px", fontSize: "24px", fontWeight: "bold" }}
      >
        🎫 Chợ Chuyển Nhượng Vé
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "25px",
        }}
      >
        {orders.length > 0 ? (
          orders.map((orderItem) => {
            // Lấy thông tin vé đầu tiên trong đơn hàng
            const ticket = orderItem.tickets[0];
            const concert = orderItem.concert;
            const venue = orderItem.venue;

            return (
              <div
                key={orderItem.order_id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "15px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  border: "1px solid #eee",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "15px",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "#FFD700",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {ticket.tier.name}
                  </span>
                  <span style={{ color: "#888", fontSize: "12px" }}>
                    #{ticket.ticket_id.slice(0, 8)}
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: "20px",
                    margin: "0 0 10px 0",
                    color: "#1a1a1a",
                  }}
                >
                  {concert.title}
                </h2>

                <div
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: "15px",
                  }}
                >
                  <p style={{ margin: "5px 0" }}>
                    👤 Nghệ sĩ: <strong>{concert.artist}</strong>
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    📍 {venue.name}, {venue.city}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    🪑 Ghế: <strong>{ticket.seat.label}</strong> (Hàng{" "}
                    {ticket.seat.row})
                  </p>
                </div>

                <div
                  style={{
                    borderTop: "1px dashed #ddd",
                    paddingTop: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "12px", color: "#999", margin: 0 }}>
                      Giá chuyển nhượng
                    </p>
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#2ecc71",
                        margin: 0,
                      }}
                    >
                      {ticket.price.unit_price} {orderItem.order.currency}
                    </p>
                  </div>

                  <button
                    onClick={() => handleBuyTicket(ticket.ticket_id)} // Gọi hàm với ticket_id từ API
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: "50px",
              color: "#666",
            }}
          >
            Hiện không có vé nào đang được rao bán.
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
