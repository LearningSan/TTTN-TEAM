import { useState, useEffect ,useRef} from 'react';
import { Input,Select,Table, Button, Space, message, Popconfirm, Form, Card, Tag, Tooltip } from 'antd';
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
  const [keyword, setKeyword] = useState('');
  const [filterVenueId, setFilterVenueId] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  
  // Dùng để tránh gọi API lần đầu khi vừa render
  const isFirstRender = useRef(true);
  const parseApiDate = (dateStr) => {
    if (!dateStr || dateStr === 'null') return null;
    const d = dayjs(dateStr, "DD/MM/YYYY HH:mm:ss");
    return d.isValid() ? d : null;
  };

  const formatSafeDate = (dateStr) => {
    const d = parseApiDate(dateStr);
    return d ? d.format('DD/MM/YYYY HH:mm') : 'N/A';
  };

  const fetchData = async (page = 1, pageSize = 10, kw = keyword, vId = filterVenueId, st = filterStatus) => {
    setLoading(true);
    try {
      let url = `/admin/concerts?page=${page - 1}&size=${pageSize}`;
      if (kw) url += `&keyword=${encodeURIComponent(kw)}`;
      if (vId) url += `&venueId=${vId}`;
      if (st) url += `&status=${st}`;
      const [resConcerts, resVenues] = await Promise.all([
        API.get(url),
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

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchData(); // Chỉ chạy lần đầu
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchData(1, pagination.pageSize, keyword, filterVenueId, filterStatus);
    }, 500); // Đợi 500ms sau khi ngừng gõ mới gọi API

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  // 🚀 HÀM LÀM MỚI (RESET TOÀN BỘ)
  const handleReset = () => {
    setKeyword('');
    setFilterVenueId(null);
    setFilterStatus(null);
    // Gọi API với tham số rỗng để quay về trạng thái ban đầu
    fetchData(1, 10, '', null, null);
    message.success('Đã xóa bộ lọc!');
  };

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
    const layoutConfigObj = { 
      canvasConfig: { width: 1100, height: 550 },
      stages: values.stages || [],
      zoneLayouts: values.zones?.map(z => ({
        zoneName: z.zoneName, 
        layoutConfig: z.layoutConfig || { x: 50, y: 150, w: 120, h: 60 }
      }))
    };

    const payload = {
      // Bốc đích danh các trường của ConcertRequest, KHÔNG dùng ...values để tránh gửi nhầm trường stages
      title: values.title,
      artist: values.artist,
      description: values.description,
      bannerURL: values.bannerURL,
      venueId: values.venueId,
      status: values.status,
      layoutConfig: JSON.stringify(layoutConfigObj),
      
      // Xử lý ngày tháng như đệ đã làm chuẩn
      concertDate: values.concertDate ? values.concertDate.format('YYYY-MM-DDTHH:mm:ss') : null,
      endDate: values.endDate ? values.endDate.format('YYYY-MM-DDTHH:mm:ss') : null,
      saleStartAt: values.saleStartAt ? values.saleStartAt.format('YYYY-MM-DDTHH:mm:ss') : null,
      saleEndAt: values.saleEndAt ? values.saleEndAt.format('YYYY-MM-DDTHH:mm:ss') : null,
      
      zones: values.zones?.map((z, i) => {
        const isSeated = z.hasSeatMap;
        let calculatedTotal = 0; 
        
        const mappedTiers = isSeated ? z.tiers?.map((t, j) => {
          const rCount = t.rowCount || 1;
          const sCount = t.seatsPerRow || 1;
          calculatedTotal += (rCount * sCount);
          
          // 🚀 Chỉ gửi đúng những gì TierRequest cần + tierId (để Update)
          return {
            tierId: t.tierId, // Rất quan trọng khi SỬA
            tierName: t.tierName || 'STANDARD', 
            price: t.price,
            currency: z.currency || 'USDT', 
            colorCode: t.colorCode || z.colorCode || ZONE_COLORS[0].value,
            displayOrder: j + 1,
            rowPrefix: t.rowPrefix?.toUpperCase(), 
            rowCount: rCount, 
            seatsPerRow: sCount
          };
        }) || [] : [];

        // 🚀 Chỉ gửi đúng những gì ZoneRequest cần + zoneId (để Update)
        return {
          zoneId: z.zoneId, // Rất quan trọng khi SỬA
          zoneName: z.zoneName?.trim() || `Khu vực ${i+1}`, 
          price: z.price,
          currency: z.currency,
          colorCode: z.colorCode || ZONE_COLORS[i % ZONE_COLORS.length].value,
          hasSeatMap: isSeated,
          displayOrder: i + 1,
          totalSeats: isSeated ? calculatedTotal : (z.totalSeats || 1), 
          tiers: mappedTiers
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
      let savedStages = [], savedZoneLayouts = [];
      try {
        if (fullData.layoutConfig && fullData.layoutConfig.startsWith('{')) {
          const parsed = JSON.parse(fullData.layoutConfig);
          savedStages = parsed.stages || [];
          savedZoneLayouts = parsed.zoneLayouts || [];
        }
      } catch  { console.warn("Lỗi parse layoutConfig"); }

      const processedZones = fullData.zones?.map((z) => {
        const matchedZone = savedZoneLayouts.find(layoutObj => layoutObj.zoneName === z.zoneName);
        const layout = matchedZone ? matchedZone.layoutConfig : { x: 50, y: 150, w: 120, h: 60 };
        return { ...z, layoutConfig: layout };
      });

      form.resetFields();
      form.setFieldsValue({
        ...fullData, stages: savedStages, zones: processedZones,
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
            <Button icon={<ReloadOutlined />} onClick={handleReset}>Làm mới</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { 
              form.setFieldsValue({ 
                status: 'DRAFT', 
                stages: [{ name: 'Sân khấu', shape: 'rectangle', layoutConfig: {x: 300, y: 20, w: 200, h: 80} }],
                zones: [{ zoneName: 'Khu vực 1', price: 10, currency: 'USDT', colorCode: ZONE_COLORS[0].value, hasSeatMap: true, layoutConfig: {x: 50, y: 150, w: 120, h: 60}, tiers: [{ price: 10, rowPrefix: 'A', rowCount: 1, seatsPerRow: 2 }] }] 
              });
              setModalState({ open: true, id: null }); 
            }}>Tạo Concert</Button>
          </Space>
        }
      >
        {/* 🚀 THANH CÔNG CỤ TÌM KIẾM LIVE SEARCH */}
        <div style={{ marginBottom: 16, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm theo tên concert hoặc nghệ sĩ..."
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)} // Cập nhật state liên tục để useEffect bên trên tự gọi API
            style={{ width: 350 }}
          />
          
          <Select
            placeholder="Lọc theo Địa điểm"
            allowClear
            style={{ width: 250 }}
            value={filterVenueId}
            options={venues.map(v => ({ value: v.venueId || v.venue_id, label: v.venueName }))}
            onChange={(val) => {
              setFilterVenueId(val);
              fetchData(1, pagination.pageSize, keyword, val, filterStatus);
            }}
          />

          <Select
            placeholder="Lọc theo Trạng thái"
            allowClear
            style={{ width: 200 }}
            value={filterStatus}
            onChange={(val) => {
              setFilterStatus(val);
              fetchData(1, pagination.pageSize, keyword, filterVenueId, val);
            }}
            options={[
              { value: 'ON_SALE', label: 'ON_SALE' },
              { value: 'DRAFT', label: 'DRAFT' },
              { value: 'COMPLETED', label: 'COMPLETED' },
              { value: 'CANCELLED', label: 'CANCELLED' },
              { value: 'SOLD_OUT', label: 'SOLD_OUT' },
            ]}
          />
        </div>

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