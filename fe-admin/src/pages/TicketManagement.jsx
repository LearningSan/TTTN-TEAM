import { useState, useEffect } from 'react';
import { Table, Select, Card, Row, Col, message, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import API from '../api/config';

const { Title } = Typography;

const TicketManagement = () => {
  const [concerts, setConcerts] = useState([]);
  const [selectedConcertId, setSelectedConcertId] = useState(null);
  
  // State lưu 3 con số tổng quan (total, sold, available)
  const [ticketStats, setTicketStats] = useState({ total: 0, sold: 0, available: 0 });
  
  // State lưu danh sách người mua
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Lấy danh sách Concert để nạp vào Combobox
  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        // Có thể cần truyền tham số để lấy tất cả, hoặc chỉ những show ON_SALE/COMPLETED
        const res = await API.get('/admin/concerts?page=0&size=100'); 
        setConcerts(res.data?.content || res.data || []);
      } catch (error) {
        message.error('Lỗi tải danh sách Concert!');
      }
    };
    fetchConcerts();
  }, []);

  // 2. Lấy dữ liệu Vé khi Admin chọn 1 Concert cụ thể
  const handleSelectConcert = async (concertId) => {
    setSelectedConcertId(concertId);
    setLoading(true);
    try {
      // Gọi song song 2 API: 1 cái lấy thống kê số lượng, 1 cái lấy danh sách người mua
      const [resStats, resTickets] = await Promise.all([
        API.get(`/admin/concerts/${concertId}/ticket-stats`), // API này lấy total, sold, available
        API.get(`/admin/tickets?concertId=${concertId}`)      // API này lấy danh sách user mua
      ]);

      setTicketStats(resStats.data || { total: 0, sold: 0, available: 0 });
      setTickets(resTickets.data?.content || resTickets.data || []);
    } catch (error) {
      message.error('Lỗi tải dữ liệu vé của Concert này!');
      // Đưa state về rỗng nếu lỗi
      setTicketStats({ total: 0, sold: 0, available: 0 });
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình cột cho bảng người mua vé
  const columns = [
    {
      title: 'Khách hàng',
      key: 'user',
      render: (_, record) => (
        <div>
          <b>{record.name}</b><br/>
          <span style={{ fontSize: '12px', color: 'gray' }}>{record.email}</span>
        </div>
      )
    },
    { 
      title: 'Địa chỉ Ví (Wallet)', 
      dataIndex: 'walletAddress', 
      render: (w) => w ? <span style={{ fontFamily: 'monospace' }}>{w.substring(0, 6)}...{w.substring(w.length - 4)}</span> : 'N/A'
    },
    { 
      title: 'Mã vé (Ticket ID)', 
      dataIndex: 'ticketId',
      render: (id) => <span style={{ fontSize: '12px', color: '#1890ff' }}>{id?.substring(0, 8)}</span>
    },
    { 
      title: 'Token ID', 
      dataIndex: 'tokenId',
      render: (token) => token ? <Tag color="purple">#{token}</Tag> : <Tag>Chưa Mint</Tag>
    },
    { 
      title: 'Ngày mua', 
      dataIndex: 'purchaseDate', 
      render: (d) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : 'N/A'
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (s) => {
        let color = s === 'ACTIVE' ? 'green' : s === 'USED' ? 'gray' : 'red';
        return <Tag color={color}>{s}</Tag>;
      }
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Quản lý Vé Concert</Title>
      
      {/* BƯỚC 1: Chọn Concert */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Chọn sự kiện:</span>
          <Select
  showSearch
  style={{ width: 400 }}
  placeholder="-- Gõ tên hoặc lướt chọn một Concert --"
  
  // Tuyệt chiêu 1: Tắt tự động focus lọc theo giá trị mặc định, chuyển sang lọc theo nhãn (label)
  optionFilterProp="label"
  
  // Tuyệt chiêu 2: Hàm xử lý lọc. Chuyển tất cả về chữ thường (toLowerCase) 
  // để gõ "vu" hay "Vu" đều tìm ra "Vũ. Khúc Tour"
  filterOption={(input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
  }
  
  onChange={handleSelectConcert}
  
  // Nạp dữ liệu vào
  options={concerts.map(c => ({ 
    value: c.concertId, 
    label: c.title 
  }))}
/>
        </div>
      </Card>

      {selectedConcertId && (
        <>
          {/* BƯỚC 2: Thẻ thống kê */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card title="🎫 Tổng số vé phát hành" bordered={false} style={{ background: '#e6f7ff' }}>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>{ticketStats.total}</Title>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="🔥 Số vé đã bán" bordered={false} style={{ background: '#f6ffed' }}>
                <Title level={2} style={{ margin: 0, color: '#52c41a' }}>{ticketStats.sold}</Title>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="🎟️ Số vé còn lại" bordered={false} style={{ background: '#fffbe6' }}>
                <Title level={2} style={{ margin: 0, color: '#faad14' }}>{ticketStats.available}</Title>
              </Card>
            </Col>
          </Row>

          {/* BƯỚC 3: Bảng danh sách người mua */}
          <Card title="📋 Danh sách chi tiết người mua vé">
            <Table 
              columns={columns} 
              dataSource={tickets} 
              rowKey="ticketId" 
              loading={loading}
              pagination={{ pageSize: 10 }}
              bordered
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default TicketManagement;