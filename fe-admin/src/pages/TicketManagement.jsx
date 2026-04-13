import { useState, useEffect, useCallback } from 'react';
import { Card, Col, Row, Select, Typography, Empty, message } from 'antd';
import API from '../api/config';
import TicketInvoiceModal from '../components/TicketInvoiceModal';
// Import các Component con đệ vừa tạo
import TicketOverview from '../components/TicketOverview';
import TicketZoneStats from '../components/TicketZoneStats';
import TicketListTable from '../components/TicketListTable';

const { Title } = Typography;

const TicketManagement = () => {
  const [concerts, setConcerts] = useState([]);
  const [selectedConcertId, setSelectedConcertId] = useState(null);
  const [concertDetail, setConcertDetail] = useState(null);
  const [tickets, setTickets] = useState([]);
  
  const [loadingList, setLoadingList] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  
  const [ticketPagination, setTicketPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [invoiceModal, setInvoiceModal] = useState({ open: false, ticketId: null });
  // Lấy danh sách Concert vào SelectBox
  useEffect(() => {
    const fetchConcertList = async () => {
      setLoadingList(true);
      try {
        const res = await API.get('/admin/concerts?size=100');
        setConcerts(res.data?.content || []);
      } catch  {
        message.error("Không thể tải danh sách concert");
      } finally { setLoadingList(false); }
    };
    fetchConcertList();
  }, []);

  // Hàm lấy danh sách vé đã mua
  const fetchTickets = useCallback(async (concertId, page = 0, size = 10) => {
    setLoadingTickets(true);
    try {
      const res = await API.get(`/admin/concerts/${concertId}/tickets`, { params: { page, size } });
      setTickets(res.data?.content || []);
      setTicketPagination(prev => ({ ...prev, current: page + 1, total: res.data?.totalElements || 0 }));
    } catch  { message.error("Không thể kết nối máy chủ để lấy danh sách vé!"); } 
    finally { setLoadingTickets(false); }
  }, []);

  // Hàm lấy thống kê từ Concert Detail
  const fetchConcertDetail = async (id) => {
    setLoadingStats(true);
    try {
      const res = await API.get(`/admin/concerts/${id}`);
      setConcertDetail(res.data); 
    } catch  { message.error("Lỗi khi lấy thông tin thống kê phát hành!"); } 
    finally { setLoadingStats(false); }
  };

  // Xử lý khi chọn 1 Concert từ SelectBox
  const handleSelectConcert = (id) => {
    setSelectedConcertId(id);
    setConcertDetail(null); 
    setTickets([]);
    fetchConcertDetail(id);
    fetchTickets(id, 0, ticketPagination.pageSize);
  };

  // Logic tính toán gộp (Doanh thu, Vé)
  const getAdvancedStats = () => {
    if (!concertDetail?.zones) return { total: 0, available: 0, sold: 0, revenue: 0, currency: 'USDT' };
    
    let total = 0, available = 0, sold = 0, revenue = 0, currency = 'USDT';

    concertDetail.zones.forEach(zone => {
      currency = zone.currency || currency;
      if (zone.hasSeatMap && zone.tiers) {
        zone.tiers.forEach(tier => {
          const tTotal = tier.totalSeats || 0;
          const tAvail = tier.availableSeats || 0;
          const tSold = tTotal - tAvail;
          total += tTotal; available += tAvail; sold += tSold; revenue += (tSold * (tier.price || 0));
        });
      } else {
        const zTotal = zone.totalSeats || 0;
        const zAvail = zone.availableSeats || 0;
        const zSold = zTotal - zAvail;
        total += zTotal; available += zAvail; sold += zSold; revenue += (zSold * (zone.price || 0));
      }
    });
    return { total, available, sold, revenue, currency };
  };

  const stats = getAdvancedStats();

  return (
    <div style={{ padding: 1, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* HEADER: CHỌN CONCERT */}
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <Row align="middle" gutter={24}>
          <Col span={6}><Title level={4} style={{ margin: 0 }}>Quản lý Vé & Phát hành</Title></Col>
          <Col span={18}>
            <Select
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              placeholder="🔍 Tìm và chọn concert để quản lý vé..."
              style={{ width: '100%' }}
              size="large"
              onChange={handleSelectConcert}
              loading={loadingList} 
              disabled={loadingList}
              options={concerts.map(c => ({ value: c.concertId, label: c.title }))}
            />
          </Col>
        </Row>
      </Card>

      {/* NẾU CHƯA CHỌN THÌ HIỆN EMPTY, CHỌN RỒI THÌ RENDER CÁC COMPONENT CON */}
      {!selectedConcertId ? (
        <Empty description="Vui lòng chọn một Concert ở trên để xem chi tiết vé" style={{ marginTop: 100 }} />
      ) : (
        <>
          <TicketOverview stats={stats} loading={loadingStats} />
          
          <TicketZoneStats zones={concertDetail?.zones || []} loading={loadingStats} />
          
          <TicketListTable 
            tickets={tickets} 
            loading={loadingTickets} 
            pagination={ticketPagination} 
            onChangePage={fetchTickets} 
            concertId={selectedConcertId}
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