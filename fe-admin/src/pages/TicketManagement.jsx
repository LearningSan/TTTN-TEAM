import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Table, Tag, Button, Space, Typography, message, Input, Avatar } from 'antd';
import { EyeOutlined, LeftOutlined, DashboardOutlined, ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import API from '../api/config';
import TicketInvoiceModal from '../components/TicketInvoiceModal';
import TicketOverview from '../components/TicketOverview';
import TicketZoneStats from '../components/TicketZoneStats';
import TicketListTable from '../components/TicketListTable';

const { Title, Text } = Typography;

const TicketManagement = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' hoặc 'detail'
  const [concerts, setConcerts] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedConcert, setSelectedConcert] = useState(null); // Lưu nguyên object concert
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [ticketPagination, setTicketPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [invoiceModal, setInvoiceModal] = useState({ open: false, ticketId: null });
  const isFirstRender = useRef(true);
  // 🚀 Hàm tính toán stats cho 1 concert (Dùng chung cho cả Bảng và Overview)
  const calculateStats = useCallback((concert) => {
    if (!concert?.zones) return { total: 0, available: 0, sold: 0, revenueMap: {} };
    let total = 0, available = 0, sold = 0;
    const revenueMap = {};
    let totalValue = 0;
    concert.zones.forEach(zone => {
      const curr = zone.currency || 'USDT';
      if (!revenueMap[curr]) revenueMap[curr] = 0;
      const zoneSold = (zone.totalSeats || 0) - (zone.availableSeats || 0);

      if (zone.hasSeatMap && zone.tiers) {
        zone.tiers.forEach(tier => {
          const tSold = (tier.totalSeats || 0) - (tier.availableSeats || 0);
          total += tier.totalSeats || 0;
          available += tier.availableSeats || 0;
          sold += tSold;
          const rev = tSold * (tier.price || 0);
          revenueMap[curr] += rev;
          totalValue += rev; // Cộng dồn để lấy trọng số sắp xếp
        });
      } else {
        total += zone.totalSeats || 0;
        available += zone.availableSeats || 0;
        sold += zoneSold;
        const rev = zoneSold * (zone.price || 0);
        revenueMap[curr] += rev;
        totalValue += rev;
      }
    });
    return { total, available, sold, revenueMap, totalValue };
  }, []);

  // 🚀 Tải danh sách Concert (Phân trang chuẩn)
  const fetchConcertList = useCallback(async (page = 1, size = 10, kw = keyword) => {
    setLoading(true);
    try {
      let url = `/admin/concerts?page=${page - 1}&size=${size}`;
      if (kw) url += `&keyword=${encodeURIComponent(kw)}`;
      const res = await API.get(url);
      setConcerts(res.data?.content || []);
      setPagination(prev => ({ ...prev, current: page, total: res.data?.totalElements || 0 }));
    } catch {
      message.error("Không thể tải danh sách concert");
    } finally { setLoading(false); }
  }, [keyword]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchConcertList();
      return;
    }
    const delay = setTimeout(() => {
      fetchConcertList(1, pagination.pageSize, keyword);
    }, 500);
    return () => clearTimeout(delay);
  }, [keyword, fetchConcertList, pagination.pageSize]);

  // 🚀 Tải danh sách vé cho concert được chọn
  const fetchTickets = useCallback(async (concertId, page = 0, size = 10) => {
    setLoadingTickets(true);
    try {
      const res = await API.get(`/admin/concerts/${concertId}/tickets`, { params: { page, size } });
      setTickets(res.data?.content || []);
      setTicketPagination(prev => ({ ...prev, current: page + 1, total: res.data?.totalElements || 0 }));
    } catch { message.error("Không thể lấy danh sách vé!"); }
    finally { setLoadingTickets(false); }
  }, []);

  const handleOpenDetail = (record) => {
    setSelectedConcert(record);
    setViewMode('detail');
    fetchTickets(record.concertId, 0, 10);
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedConcert(null);
  };

  // 🚀 ĐỊNH NGHĨA CỘT CHO BẢNG DANH SÁCH CONCERT
  const concertColumns = [
    {
      title: 'Concert',
      render: (_, r) => (
        <Space>
          <Avatar src={r.bannerURL} shape="square" size={48} />
          <div style={{ maxWidth: 200 }}><Text strong>{r.title}</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>{r.artist}</Text></div>
        </Space>
      )
    },
    {
      title: 'Thống kê vé',
      render: (_, r) => {
        const s = calculateStats(r);
        return (
          <Space direction="vertical" size={0}>
            <Text>Tổng: <Text strong>{s.total}</Text></Text>
            <Text>Đã bán: <Tag color="green">{s.sold}</Tag></Text>
            <Text>Còn lại: <Tag color="orange">{s.available}</Tag></Text>
          </Space>
        );
      }
    },
    {
      title: 'Doanh thu',
      // sorter: (a, b) => calculateStats(a).totalValue - calculateStats(b).totalValue,
      render: (_, r) => {
        const s = calculateStats(r);

        return Object.entries(s.revenueMap).map(([curr, val]) => (
          <div key={curr}><Text strong style={{ color: '#722ed1' }}>{val.toLocaleString()} {curr}</Text></div>
        ));
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => <Tag color={status === 'ON_SALE' ? 'green' : 'default'}>{status}</Tag>
    },
    {
      title: 'Thao tác',
      align: 'center',
      render: (_, r) => (
        <Button type="primary" ghost icon={<DashboardOutlined />} onClick={() => handleOpenDetail(r)}>
          Xem tình trạng vé
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      {viewMode === 'list' ? (
        <Card title={<Space><ShoppingCartOutlined /> <Title level={4} style={{ margin: 0 }}>Quản lý Vé & Doanh thu</Title></Space>} bordered={false}>
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Tìm tên concert hoặc nghệ sĩ..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              allowClear
              size="large"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 450, borderRadius: 8 }}
            />
          </div>
          <Table
            columns={concertColumns}
            dataSource={concerts}
            rowKey="concertId"
            loading={loading}
            pagination={pagination}
            onChange={(p) => fetchConcertList(p.current, p.pageSize)}
          />
        </Card>
      ) : (
        <>
          <Button icon={<LeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>Quay lại danh sách</Button>
          <Title level={3} style={{ marginBottom: 24 }}>Chi tiết vé: {selectedConcert?.title}</Title>

          {/* Reuse các component cũ với dữ liệu từ selectedConcert */}
          <TicketOverview stats={calculateStats(selectedConcert)} loading={false} />
          <TicketZoneStats zones={selectedConcert?.zones || []} loading={false} />
          <TicketListTable
            tickets={tickets}
            loading={loadingTickets}
            pagination={ticketPagination}
            onChangePage={fetchTickets}
            concertId={selectedConcert?.concertId}
            onViewInvoice={(tId) => setInvoiceModal({ open: true, ticketId: tId })}
          />
        </>
      )}

      <TicketInvoiceModal
        open={invoiceModal.open}
        ticketId={invoiceModal.ticketId}
        onCancel={() => setInvoiceModal({ open: false, ticketId: null })}
      />
    </div>
  );
};

export default TicketManagement;