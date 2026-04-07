import { useState, useEffect, useCallback } from 'react';
import { 
  Card, Col, Row, Statistic, Table, Select, 
  Tag, Space, Typography, Badge, Empty, message 
} from 'antd';
import { 
  UserOutlined, TagOutlined, BarChartOutlined, LoadingOutlined, IdcardOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import API from '../api/config';

const { Title, Text } = Typography;

const TicketManagement = () => {
  const [concerts, setConcerts] = useState([]);
  const [selectedConcertId, setSelectedConcertId] = useState(null);
  const [concertDetail, setConcertDetail] = useState(null);
  const [tickets, setTickets] = useState([]);
  
  const [loadingList, setLoadingList] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  
  const [ticketPagination, setTicketPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    const fetchConcertList = async () => {
      setLoadingList(true);
      try {
        const res = await API.get('/admin/concerts?size=100');
        setConcerts(res.data?.content || []);
      } catch  {
        message.error("Không thể tải danh sách concert");
      } finally {
        setLoadingList(false);
      }
    };
    fetchConcertList();
  }, []);

  // Hàm lấy danh sách vé đã mua
  const fetchTickets = useCallback(async (concertId, page = 0, size = 10) => {
    setLoadingTickets(true);
    try {
      const res = await API.get(`/admin/concerts/${concertId}/tickets`, {
        params: { page, size }
      });
      // Backend trả về content: [] thì lấy mảng rỗng, không báo lỗi
      const ticketData = res.data?.content || [];
      setTickets(ticketData);
      setTicketPagination(prev => ({
        ...prev,
        current: page + 1,
        total: res.data?.totalElements || 0
      }));
    } catch (error) {
      console.error("Ticket API Error:", error);
      // Chỉ báo lỗi nếu status khác 200
      message.error("Không thể kết nối máy chủ để lấy danh sách vé!");
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  // Hàm lấy thống kê từ Concert Detail
  const fetchConcertDetail = async (id) => {
    setLoadingStats(true);
    try {
      const res = await API.get(`/admin/concerts/${id}`);
      // Lưu ý: Cấu trúc response phải khớp với ConcertResponse trong apidocs
      setConcertDetail(res.data); 
    } catch (error) {
      console.error("Detail API Error:", error);
      message.error("Lỗi khi lấy thông tin thống kê phát hành!");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSelectConcert = (id) => {
    setSelectedConcertId(id);
    setConcertDetail(null); 
    setTickets([]);
    fetchConcertDetail(id);
    fetchTickets(id, 0, ticketPagination.pageSize);
  };

  // Tính toán số liệu từ mảng zones
  const getTicketStats = () => {
    if (!concertDetail?.zones) return { total: 0, available: 0, sold: 0 };
    return concertDetail.zones.reduce((acc, zone) => {
      const total = zone.totalSeats || 0;
      const available = zone.availableSeats || 0;
      return {
        total: acc.total + total,
        available: acc.available + available,
        sold: acc.sold + (total - available)
      };
    }, { total: 0, available: 0, sold: 0 });
  };

  const stats = getTicketStats();

  const columns = [
    { 
      title: 'Khách hàng', 
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.buyerName || 'Khách ẩn danh'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>
        </Space>
      )
    },
    { title: 'Địa chỉ Ví (Wallet)', dataIndex: 'walletAddress', render: (w) => <Text copyable style={{fontSize: 12}}>{w || 'N/A'}</Text> },
    { title: 'Vị trí', render: (_, r) => <Tag color="blue">{r.zoneName} - {r.seatLabel}</Tag> },
    { title: 'Ngày mua', dataIndex: 'purchaseDate', render: (d) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '-' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status',
      render: (s) => <Badge status={s === 'ACTIVE' ? 'success' : 'processing'} text={s} />
    }
  ];

  return (
    <div style={{ padding: 1, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <Row align="middle" gutter={24}>
          <Col span={4}><Title level={4} style={{ margin: 0 }}>Quản lý Vé</Title></Col>
          <Col span={20}>
            <Select
              showSearch
              placeholder="🔍 Chọn concert để quản lý vé..."
              style={{ width: '100%' }}
              size="large"
              onChange={handleSelectConcert}
              options={concerts.map(c => ({ value: c.concertId, label: c.title }))}
              optionFilterProp="label"
            />
          </Col>
        </Row>
      </Card>

      {!selectedConcertId ? (
        <Empty description="Vui lòng chọn concert" style={{ marginTop: 100 }} />
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card bordered={false} style={{ borderLeft: '4px solid #1890ff' }}>
                <Statistic title="🎫 Tổng số vé phát hành" value={stats.total} loading={loadingStats} />
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} style={{ borderLeft: '4px solid #52c41a' }}>
                <Statistic title="🔥 Số vé đã bán" value={stats.sold} loading={loadingStats} />
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} style={{ borderLeft: '4px solid #faad14' }}>
                <Statistic title="🎟️ Số vé còn lại" value={stats.available} loading={loadingStats} />
              </Card>
            </Col>
          </Row>

          <Card title={<><IdcardOutlined /> Danh sách chi tiết người mua vé</>} bordered={false}>
            <Table 
              columns={columns} 
              dataSource={tickets} 
              rowKey="ticketId" 
              loading={loadingTickets}
              pagination={ticketPagination}
              onChange={(p) => fetchTickets(selectedConcertId, p.current - 1, p.pageSize)}
              locale={{ emptyText: "Sự kiện này hiện chưa có người mua vé" }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default TicketManagement;