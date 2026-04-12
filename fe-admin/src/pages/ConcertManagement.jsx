import { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, Form, Card, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import API from '../api/config';
import ConcertFormModal from '../components/ConcertFormModal';
import ConcertDetailModal from '../components/ConcertDetailModal';

dayjs.extend(customParseFormat);

const ZONE_COLORS = [
  { value: '#FF4D4F', label: 'Đỏ (Red)' },
  { value: '#1890FF', label: 'Xanh dương (Blue)' },
  { value: '#52C41A', label: 'Xanh lá (Green)' },
  { value: '#FAAD14', label: 'Vàng (Yellow)' },
  { value: '#FA8C16', label: 'Cam (Orange)' },
  { value: '#722ED1', label: 'Tím (Purple)' },
  { value: '#13C2C2', label: 'Xanh ngọc (Cyan)' },
  { value: '#EB2F96', label: 'Hồng (Pink)' },
  { value: '#A0D911', label: 'Xanh chanh (Lime)' },
  { value: '#5C0011', label: 'Đỏ thẫm (Dark Red)' }
];

const ConcertManagement = () => {
  const [concerts, setConcerts] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({ open: false, id: null });
  const [detailModal, setDetailModal] = useState({ open: false, data: null, loading: false });
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const parseApiDate = (dateStr) => {
    if (!dateStr || dateStr === 'null') return null;
    const d = dayjs(dateStr, "DD/MM/YYYY HH:mm:ss");
    return d.isValid() ? d : null;
  };

  const formatSafeDate = (dateStr) => {
    const d = parseApiDate(dateStr);
    return d ? d.format('DD/MM/YYYY HH:mm') : 'N/A';
  };

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const [resConcerts, resVenues] = await Promise.all([
        API.get(`/admin/concerts?page=${page - 1}&size=${pageSize}`),
        API.get('/admin/venues')
      ]);
      const cData = resConcerts.data;
      setConcerts(Array.isArray(cData?.content) ? cData.content : (Array.isArray(cData) ? cData : []));
      const vData = resVenues.data;
      setVenues(Array.isArray(vData?.content) ? vData.content : (Array.isArray(vData) ? vData : []));
      if (cData?.totalElements !== undefined) {
        setPagination(prev => ({ ...prev, current: page, total: cData.totalElements }));
      }
    } catch {
      message.error('Lỗi tải dữ liệu hệ thống!');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleViewDetail = async (id) => {
    setDetailModal({ open: true, data: null, loading: true });
    try {
      const res = await API.get(`/admin/concerts/${id}`);
      setDetailModal({ open: true, data: res.data?.data || res.data, loading: false });
    } catch  {
      message.error("Không thể lấy thông tin chi tiết!");
      setDetailModal({ open: false, data: null, loading: false });
    }
  };

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const concertDescriptionObj = { 
        text: values.description || '', 
        canvasConfig: {
        width: 1100, // Chiều rộng chuẩn của Modal/Canvas lúc Admin vẽ
        height: 550  // Chiều cao chuẩn của khung đen
      },
        stages: values.stages || [],
        zoneLayouts: values.zones?.map(z => ({
    zoneName: z.zoneName, 
    layoutConfig: z.layoutConfig || { x: 50, y: 150, w: 120, h: 60 }
  }))
      };

      const payload = {
        ...values,
        description: JSON.stringify(concertDescriptionObj),
        concertDate: values.concertDate ? values.concertDate.toISOString() : null,
        endDate: values.endDate ? values.endDate.toISOString() : null,
        saleStartAt: values.saleStartAt ? values.saleStartAt.toISOString() : null,
        saleEndAt: values.saleEndAt ? values.saleEndAt.toISOString() : null,
        zones: values.zones?.map((z, i) => {
          const isSeated = z.hasSeatMap;
          let calculatedTotal = 0; 
          const mappedTiers = isSeated ? z.tiers?.map((t, j) => {
            const rCount = t.rowCount || 1;
            const sCount = t.seatsPerRow || 1;
            calculatedTotal += (rCount * sCount);
            return {
              ...t, tierName: t.tierName || 'STANDARD', displayOrder: j + 1,
              currency: z.currency || 'USDT', colorCode: z.colorCode || ZONE_COLORS[0].value,
              rowPrefix: t.rowPrefix?.toUpperCase(), rowCount: rCount, seatsPerRow: sCount
            };
          }) || [] : [];
          return {
            ...z, zoneName: z.zoneName?.trim() || `Khu vực ${i+1}`, displayOrder: i + 1,
            colorCode: z.colorCode || ZONE_COLORS[i % ZONE_COLORS.length].value,
            totalSeats: isSeated ? calculatedTotal : (z.totalSeats || 1), tiers: mappedTiers
          };
        }) || []
      };

      if (modalState.id) {
        await API.put(`/admin/concerts/${modalState.id}`, payload);
        message.success('Cập nhật Concert thành công!');
      } else {
        await API.post('/admin/concerts', payload);
        message.success('Tạo Concert thành công!');
      }
      setModalState({ open: false, id: null });
      fetchData(pagination.current);
    } catch (error) {
      const backendMsg = error.response?.data?.message || 'Có lỗi xảy ra!';
      message.error(`Lưu thất bại: ${backendMsg}`);
    } finally { setLoading(false); }
  };

  const handleOpenEdit = async (record) => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/concerts/${record.concertId || record.id}`);
      const fullData = res.data;
      
      let descText = fullData.description, savedStages = [], savedZoneLayouts = [];
      try {
        if (descText?.startsWith('{')) {
          const parsed = JSON.parse(descText);
          descText = parsed.text; 
          savedStages = parsed.stages || [];
          savedZoneLayouts = parsed.zoneLayouts || [];
        }
      } catch  { console.warn("Lỗi parse description"); }

      const processedZones = fullData.zones?.map((z) => {
        const matchedZone = savedZoneLayouts.find(layoutObj => layoutObj.zoneName === z.zoneName);
        const layout = matchedZone ? matchedZone.layoutConfig : { x: 50, y: 150, w: 120, h: 60 };
        return { ...z, layoutConfig: layout };
      });

      form.resetFields();
      form.setFieldsValue({
        ...fullData, description: descText, stages: savedStages, zones: processedZones,
        concertDate: parseApiDate(fullData.concertDate), endDate: parseApiDate(fullData.endDate),
        saleStartAt: parseApiDate(fullData.saleStartAt), saleEndAt: parseApiDate(fullData.saleEndAt),
      });
      setModalState({ open: true, id: fullData.concertId || fullData.id });
    } catch  { message.error("Không thể lấy dữ liệu chi tiết!"); } finally { setLoading(false); }
  };

  const columns = [
    { title: 'Banner', dataIndex: 'bannerURL', width: 100, render: (url) => <img src={url || 'https://placehold.co/80x45?text=No+Img'} style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 4 }} alt="banner" /> },
    { title: 'Tên Concert', dataIndex: 'title', ellipsis: true },
    { title: 'Nghệ sĩ', dataIndex: 'artist' },
    { title: 'Địa điểm', dataIndex: 'venueId', render: (vId, record) => record.venueName || venues.find(v => (v.venueId || v.venue_id) === vId)?.name || 'Chưa cập nhật' },
    { title: 'Ngày diễn', dataIndex: 'concertDate', render: (d) => formatSafeDate(d) },
    { title: 'Trạng thái', dataIndex: 'status', width: 120, render: (status) => <Tag color={{'ON_SALE': 'green', 'DRAFT': 'blue', 'CANCELLED': 'red', 'COMPLETED': 'gray'}[status] || 'default'}>{status || 'ACTIVE'}</Tag> },
    { title: 'Hành động', render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết"><Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(r.concertId || r.id)} /></Tooltip>
          <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => handleOpenEdit(r)}>Sửa</Button>
          <Popconfirm title="Xóa concert?" onConfirm={() => API.delete(`/admin/concerts/${r.concertId || r.id}`).then(() => { message.success('Thành công!'); fetchData(pagination.current); }).catch(() => message.error('Thất bại!'))}>
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ) 
    }
  ];

  return (
    <div style={{ padding: 1, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card 
        title={<h2 style={{ margin: 0 }}>Quản lý Concert</h2>} 
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchData(pagination.current)}>Làm mới</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { 
              form.setFieldsValue({ 
                status: 'DRAFT', 
                stages: [{ name: 'STAGE', shape: 'rectangle', layoutConfig: {x: 300, y: 20, w: 200, h: 80} }],
                zones: [{ zoneName: 'Khu vực 1', price: 10, currency: 'USDT', colorCode: ZONE_COLORS[0].value, hasSeatMap: true, layoutConfig: {x: 50, y: 150, w: 120, h: 60}, tiers: [{ price: 10, rowPrefix: 'A', rowCount: 1, seatsPerRow: 2 }] }] 
              });
              setModalState({ open: true, id: null }); 
            }}>Tạo Concert</Button>
          </Space>
        }
      >
        <Table columns={columns} dataSource={concerts} rowKey={(r) => r.concertId || r.id || Math.random()} loading={loading} pagination={pagination} onChange={(p) => fetchData(p.current, p.pageSize)} bordered scroll={{ x: 800 }} />
      </Card>

      <ConcertFormModal 
        open={modalState.open} 
        modalId={modalState.id} 
        onCancel={() => setModalState({ open: false, id: null })} 
        form={form} 
        onFinish={handleFinish} 
        loading={loading} 
        venues={venues} 
        zoneColors={ZONE_COLORS} 
      />

      <ConcertDetailModal 
        open={detailModal.open} 
        data={detailModal.data} 
        loading={detailModal.loading} 
        onCancel={() => setDetailModal({ open: false, data: null, loading: false })} 
        venues={venues} 
        formatSafeDate={formatSafeDate} 
      />
    </div>
  );
};

export default ConcertManagement;