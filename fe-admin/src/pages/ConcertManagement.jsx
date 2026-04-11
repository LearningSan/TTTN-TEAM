import { useState, useEffect } from 'react';
import { 
  Table, Button, Space, message, Popconfirm, Modal, 
  Form, Input, DatePicker, Select, InputNumber, Divider, Card, Tag, Tooltip, Typography, Switch, Descriptions 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, ReloadOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import API from '../api/config';

dayjs.extend(customParseFormat);
const { Text } = Typography;

// --- DANH SÁCH 10 MÀU ZONE ---
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

  // --- CẤU HÌNH ĐỊNH DẠNG TỪ API ---
  const API_DATE_FORMAT = "DD/MM/YYYY HH:mm:ss";

  const parseApiDate = (dateStr) => {
    if (!dateStr || dateStr === 'null') return null;
    const d = dayjs(dateStr, API_DATE_FORMAT);
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
    } catch (error) {
      console.error(error);
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

  // Tính Ký tự bắt đầu (rowPrefix) tự động để tránh lỗi trùng lặp DB (uq_seat_position)
  const getNextPrefixForNewTier = (zName) => {
    const tiers = form.getFieldValue(['zones', zName, 'tiers']) || [];
    if (tiers.length === 0) return 'A';
    
    const lastTier = tiers[tiers.length - 1];
    const prefix = (lastTier.rowPrefix || 'A').toUpperCase();
    const rows = lastTier.rowCount || 1;
    
    let startIndex = 0;
    for (let i = 0; i < prefix.length; i++) {
      startIndex = startIndex * 26 + (prefix.charCodeAt(i) - 64);
    }
    let nextIndex = startIndex + rows; // Ký tự liền kề sau hạng vé trước
    
    let nextPrefix = '';
    while (nextIndex > 0) {
      let mod = (nextIndex - 1) % 26;
      nextPrefix = String.fromCharCode(65 + mod) + nextPrefix;
      nextIndex = Math.floor((nextIndex - mod) / 26);
    }
    return nextPrefix;
  };

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        concertDate: values.concertDate ? values.concertDate.toISOString() : null,
        endDate: values.endDate ? values.endDate.toISOString() : null,
        saleStartAt: values.saleStartAt ? values.saleStartAt.toISOString() : null,
        saleEndAt: values.saleEndAt ? values.saleEndAt.toISOString() : null,
        // Map dữ liệu Zones và Tiers chuẩn chỉ theo UX mới
        zones: values.zones?.map((z, i) => {
          const isSeated = z.hasSeatMap;
          return {
            ...z,
            displayOrder: i + 1,
            colorCode: z.colorCode || '#1890FF',
            totalSeats: isSeated ? 0 : (z.totalSeats || 0), // Vé đứng lấy totalSeats, Vé ngồi để BE tự tính
            tiers: isSeated 
              ? z.tiers?.map((t, j) => ({
                  ...t,
                  displayOrder: j + 1,
                  rowPrefix: t.rowPrefix?.toUpperCase(),
                  rowCount: t.rowCount,
                  seatsPerRow: t.seatsPerRow
                })) || []
              : [] // NẾU LÀ VÉ ĐỨNG: Xóa sạch mảng tiers để tránh lỗi DB
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
      console.error(error);
      const backendMsg = error.response?.data?.message || 'Có thể do trùng lặp tên Khu vực/Hạng vé hoặc trùng Sơ đồ ghế!';
      message.error(`Lưu thất bại: ${backendMsg}`);
    } finally { setLoading(false); }
  };

  const handleOpenEdit = async (record) => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/concerts/${record.concertId || record.id}`);
      const fullData = res.data;

      form.resetFields();
      form.setFieldsValue({
        ...fullData,
        concertDate: parseApiDate(fullData.concertDate),
        endDate: parseApiDate(fullData.endDate),
        saleStartAt: parseApiDate(fullData.saleStartAt),
        saleEndAt: parseApiDate(fullData.saleEndAt),
        zones: fullData.zones || []
      });
      setModalState({ open: true, id: fullData.concertId || fullData.id });
    } catch  {
      message.error("Không thể lấy dữ liệu chi tiết để sửa!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      title: 'Banner', dataIndex: 'bannerURL', width: 100,
      render: (url) => <img src={url || 'https://placehold.co/80x45?text=No+Img'} style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 4 }} alt="banner" onError={(e) => e.target.src='https://placehold.co/80x45?text=No+Img'} />
    },
    { title: 'Tên Concert', dataIndex: 'title', ellipsis: true },
    { title: 'Nghệ sĩ', dataIndex: 'artist' },
    { 
      title: 'Địa điểm', dataIndex: 'venueId',
      render: (vId, record) => {
        if (record.venueName) return record.venueName;
        const matched = venues.find(v => (v.venueId || v.venue_id) === vId);
        return matched ? (matched.name || matched.venueName) : <Text type="secondary">Chưa cập nhật</Text>;
      }
    },
    { title: 'Ngày diễn', dataIndex: 'concertDate', render: (d) => formatSafeDate(d) },
    { 
      title: 'Trạng thái', dataIndex: 'status', width: 120,
      render: (status) => {
        const colors = { 'ON_SALE': 'green', 'DRAFT': 'blue', 'CANCELLED': 'red', 'COMPLETED': 'gray' };
        return <Tag color={colors[status] || 'default'}>{status || 'ACTIVE'}</Tag>;
      }
    },
    { 
      title: 'Hành động', 
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(r.concertId || r.id)} />
          </Tooltip>
          <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => handleOpenEdit(r)}>Sửa</Button>
          <Popconfirm title="Xóa concert?" onConfirm={() => API.delete(`/admin/concerts/${r.concertId || r.id}`).then(() => {
            message.success('Xóa concert thành công!');
            fetchData(pagination.current);
          }).catch(() => message.error('Xóa concert thất bại!'))}>
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
              form.resetFields(); 
              form.setFieldsValue({ 
                status: 'DRAFT', 
                zones: [{ hasSeatMap: true, tiers: [{ tierName: 'STANDARD', price: 0, rowPrefix: 'A', rowCount: 5, seatsPerRow: 10 }] }] 
              });
              setModalState({ open: true, id: null }); 
            }}>Tạo mới</Button>
          </Space>
        }
      >
        <Table columns={columns} dataSource={concerts} rowKey={(r) => r.concertId || r.id || Math.random()} loading={loading} pagination={pagination} onChange={(p) => fetchData(p.current, p.pageSize)} bordered scroll={{ x: 800 }} />
      </Card>

      {/* MODAL THÊM / SỬA */}
      <Modal 
        title={modalState.id ? "SỬA THÔNG TIN CONCERT" : "TẠO CONCERT MỚI"} 
        open={modalState.open} 
        onCancel={() => setModalState({ open: false, id: null })} 
        footer={null} width={1100} destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Divider orientation="left">1. Thông tin chung</Divider>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
            <Form.Item name="title" label="Tên chương trình" rules={[{ required: true }]}><Input size="large" /></Form.Item>
            <Form.Item name="artist" label="Nghệ sĩ" rules={[{ required: true }]}><Input size="large" /></Form.Item>
            <Form.Item name="venueId" label="Địa điểm" rules={[{ required: true }]}>
              <Select size="large" showSearch optionFilterProp="label" options={venues.map(v => ({ value: v.venueId || v.venue_id, label: v.name || v.venueName }))} />
            </Form.Item>
          </div>

          <Divider orientation="left">2. Thời gian diễn & Mở bán</Divider>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
            <Form.Item name="concertDate" label="Ngày diễn" rules={[{ required: true }]}><DatePicker showTime format="DD/MM/YYYY HH:mm" style={{width:'100%'}} /></Form.Item>
            <Form.Item name="endDate" label="Kết thúc diễn" rules={[{ required: true }]}><DatePicker showTime format="DD/MM/YYYY HH:mm" style={{width:'100%'}} /></Form.Item>
            <Form.Item name="saleStartAt" label="Mở bán vé" rules={[{ required: true }]}><DatePicker showTime format="DD/MM/YYYY HH:mm" style={{width:'100%'}} /></Form.Item>
            <Form.Item name="saleEndAt" label="Đóng bán vé" rules={[{ required: true }]}><DatePicker showTime format="DD/MM/YYYY HH:mm" style={{width:'100%'}} /></Form.Item>
          </div>

          <Divider orientation="left">3. Cấu trúc Khu vực (Zones) & Cấu hình Ghế (Seats)</Divider>
          <Form.List name="zones">
            {(zoneFields, { add: addZone, remove: removeZone }) => (
              <>
                {zoneFields.map(({ key: zKey, name: zName, ...restZField }) => {
                  const currentZone = form.getFieldValue(['zones', zName]);
                  const isZoneLocked = currentZone?.totalSeats > 0 && currentZone?.availableSeats < currentZone?.totalSeats;
                  
                  return (
                    <Card size="small" key={zKey} style={{ marginBottom: 16, background: '#f8fbff', borderColor: isZoneLocked ? '#ffccc7' : '#bae0ff' }} 
                      title={<Space>Khu vực #{zName + 1} {isZoneLocked && <Tag color="red">Đã phát sinh giao dịch - Khóa cấu trúc</Tag>}</Space>}
                      extra={!isZoneLocked && zoneFields.length > 1 && <Button type="link" danger onClick={() => removeZone(zName)}>Xóa Khu vực</Button>}
                    >
                      <Form.Item {...restZField} name={[zName, 'zoneId']} hidden><Input /></Form.Item>
                      
                      {/* --- THÔNG TIN CƠ BẢN CỦA ZONE --- */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', gap: '12px' }}>
                        <Form.Item {...restZField} name={[zName, 'zoneName']} label="Tên Khu vực" rules={[{ required: true }]}><Input disabled={isZoneLocked} placeholder="VD: VIP A, Sân đứng..."/></Form.Item>
                        <Form.Item {...restZField} name={[zName, 'price']} label="Giá gốc (Base Price)" rules={[{ required: true }]}><InputNumber disabled={isZoneLocked} min={0} style={{width:'100%'}} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
                        <Form.Item {...restZField} name={[zName, 'currency']} label="Tiền tệ" rules={[{ required: true }]}><Select disabled={isZoneLocked} options={[{value: 'USDT', label: 'USDT'},{value: 'ETH', label: 'ETH'}]} /></Form.Item>
                        <Form.Item {...restZField} name={[zName, 'colorCode']} label="Màu hiển thị" rules={[{ required: true }]}>
                          <Select disabled={isZoneLocked} options={ZONE_COLORS.map(c => ({ value: c.value, label: <Space><div style={{width: 12, height: 12, background: c.value, borderRadius: '50%'}}></div>{c.label}</Space> }))} />
                        </Form.Item>
                      </div>

                      {/* --- UX/UI: VÉ NGỒI VS VÉ ĐỨNG --- */}
                      <Form.Item noStyle shouldUpdate>
                        {() => {
                          const hasSeatMap = form.getFieldValue(['zones', zName, 'hasSeatMap']);
                          return (
                            <div style={{ marginBottom: 8 }}>
                              <Form.Item {...restZField} name={[zName, 'hasSeatMap']} label="Tính chất khu vực (Vé đứng / Vé ngồi)" valuePropName="checked" style={{ marginBottom: 12 }}>
                                <Switch disabled={isZoneLocked} checkedChildren="Vé ngồi (Có ghế và Phân hạng)" unCheckedChildren="Vé đứng (Khu vực tự do)" />
                              </Form.Item>

                              {!hasSeatMap ? (
                                // NẾU LÀ VÉ ĐỨNG -> Chỉ hỏi số lượng vé
                                <div style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #d9d9d9' }}>
                                  <Text strong type="warning" style={{display:'block', marginBottom:12}}>🎫 Đối với vé đứng, bạn chỉ cần nhập tổng số vé bán ra. Hệ thống sẽ bỏ qua bước tạo sơ đồ ghế.</Text>
                                  <Form.Item {...restZField} name={[zName, 'totalSeats']} label="Tổng số vé bán ra" rules={[{ required: true }]}>
                                    <InputNumber disabled={isZoneLocked} min={1} style={{width:'30%'}} placeholder="VD: 1000" />
                                  </Form.Item>
                                </div>
                              ) : (
                                // NẾU LÀ VÉ NGỒI -> Hiện UI phân hạng và cấu hình ghế rõ ràng
                                <Card type="inner" title="Thiết lập Phân hạng (Tiers) & Cấu hình Sơ đồ ghế" style={{ background: '#fff' }}>
                                  <Form.List name={[zName, 'tiers']}>
                                    {(tierFields, { add: addTier, remove: removeTier }) => (
                                      <>
                                        {tierFields.map(({ key: tKey, name: tName, ...restTField }, index) => (
                                          <div key={tKey} style={{ background: '#fafafa', padding: 12, marginBottom: 12, borderRadius: 6, border: '1px dashed #d9d9d9' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                              <Text strong>Hạng vé #{index + 1}</Text>
                                              {!isZoneLocked && tierFields.length > 1 && (
                                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeTier(tName)} size="small" />
                                              )}
                                            </div>
                                            
                                            <Form.Item {...restTField} name={[tName, 'tierId']} hidden><Input /></Form.Item>
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                              <Form.Item {...restTField} name={[tName, 'tierName']} label="Tên Hạng (VD: VIP, STANDARD)" rules={[{ required: true }]}>
                                                <Input disabled={isZoneLocked} placeholder="Nhập tên hạng..." />
                                              </Form.Item>
                                              <Form.Item {...restTField} name={[tName, 'price']} label="Giá hạng vé" rules={[{ required: true }]}>
                                                <InputNumber disabled={isZoneLocked} min={0} style={{width:'100%'}} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                              </Form.Item>
                                            </div>

                                            <Divider style={{ margin: '8px 0' }} dashed />
                                            <Text type="secondary" style={{fontSize: 12, marginBottom: 8, display:'block'}}>Cấu hình sơ đồ ghế cho hạng này:</Text>
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                              <Form.Item {...restTField} name={[tName, 'rowPrefix']} label="Ký tự bắt đầu (VD: A)" rules={[{ required: true }]}>
                                                <Input disabled={isZoneLocked} style={{textTransform:'uppercase'}} placeholder="A, B, AA..." />
                                              </Form.Item>
                                              <Form.Item {...restTField} name={[tName, 'rowCount']} label="Số lượng hàng" rules={[{ required: true }]}>
                                                <InputNumber disabled={isZoneLocked} min={1} style={{width:'100%'}} placeholder="VD: 5" />
                                              </Form.Item>
                                              <Form.Item {...restTField} name={[tName, 'seatsPerRow']} label="Số ghế mỗi hàng" rules={[{ required: true }]}>
                                                <InputNumber disabled={isZoneLocked} min={1} style={{width:'100%'}} placeholder="VD: 20" />
                                              </Form.Item>
                                            </div>
                                          </div>
                                        ))}
                                        {!isZoneLocked && (
                                          <Button type="dashed" onClick={() => addTier({ tierName: '', price: 0, rowPrefix: getNextPrefixForNewTier(zName), rowCount: 1, seatsPerRow: 10 })} block icon={<PlusOutlined />}>Thêm Phân Hạng Vé Mới</Button>
                                        )}
                                      </>
                                    )}
                                  </Form.List>
                                </Card>
                              )}
                            </div>
                          );
                        }}
                      </Form.Item>

                    </Card>
                  );
                })}
                <Button type="dashed" onClick={() => addZone({ hasSeatMap: true, tiers: [{ tierName: 'STANDARD', price: 0, rowPrefix: getNextPrefixForNewTier(zoneFields.length - 1), rowCount: 5, seatsPerRow: 10 }] })} block icon={<PlusOutlined />} style={{ height: 40 }}>
                  Thêm Khu Vực (Zone)
                </Button>
              </>
            )}
          </Form.List>

          <Divider orientation="left">4. Cấu hình khác</Divider>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="bannerURL" label="Đường dẫn ảnh Banner"><Input /></Form.Item>
            <Form.Item name="status" label="Trạng thái Concert"><Select options={['DRAFT', 'ON_SALE', 'COMPLETED', 'CANCELLED'].map(v => ({value:v, label:v}))} /></Form.Item>
          </div>
          <Form.Item name="description" label="Mô tả sự kiện"><Input.TextArea rows={3} /></Form.Item>
          
          <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{height: 50, fontSize: 16, marginTop: 10}}>
            {modalState.id ? "LƯU THAY ĐỔI" : "XÁC NHẬN TẠO CONCERT"}
          </Button>
        </Form>
      </Modal>

      {/* MODAL CHI TIẾT */}
      <Modal 
        title={<b style={{fontSize: 20}}>CHI TIẾT: {detailModal.data?.title}</b>} 
        open={detailModal.open} 
        onCancel={() => setDetailModal({ open: false, data: null, loading: false })} 
        footer={[<Button key="close" type="primary" onClick={() => setDetailModal({ open: false, data: null, loading: false })}>Đóng</Button>]} 
        width={900}
        loading={detailModal.loading}
      >
        {detailModal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', background: '#000', borderRadius: 8, overflow: 'hidden' }}>
              <img src={detailModal.data.bannerURL || 'https://placehold.co/800x200?text=No+Banner'} style={{ height: 200, objectFit: 'contain', width: '100%' }} alt="banner" />
            </div>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Nghệ sĩ"><b>{detailModal.data.artist}</b></Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag color="blue">{detailModal.data.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="Địa điểm" span={2}>
                {detailModal.data.venueName || venues.find(v => (v.venueId || v.venue_id) === detailModal.data.venueId)?.name || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày diễn">{formatSafeDate(detailModal.data.concertDate)}</Descriptions.Item>
              <Descriptions.Item label="Kết thúc">{formatSafeDate(detailModal.data.endDate)}</Descriptions.Item>
              <Descriptions.Item label="Mở bán vé">{formatSafeDate(detailModal.data.saleStartAt)}</Descriptions.Item>
              <Descriptions.Item label="Đóng bán vé">{formatSafeDate(detailModal.data.saleEndAt)}</Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>{detailModal.data.description}</Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left">Cấu trúc Sơ đồ Ghế & Khu vực (Zones)</Divider>
            <Table 
              dataSource={detailModal.data.zones || []} 
              rowKey={(r) => r.zoneId || Math.random()} 
              pagination={false} 
              size="small" 
              expandable={{
                expandedRowRender: (record) => (
                  <Table 
                    dataSource={record.tiers || []} 
                    rowKey={(t) => t.tierId || Math.random()} 
                    pagination={false} 
                    size="small"
                    columns={[
                      { title: 'Hạng vé', dataIndex: 'tierName', render: (text) => <b>{text}</b> },
                      { title: 'Giá hạng', dataIndex: 'price', render: (p) => <Text type="secondary">{p?.toLocaleString()} {record.currency}</Text> },
                      { 
                        title: 'Cấu hình ghế',
                        render: (_, t) => record.hasSeatMap 
                          ? <Text type="secondary">Bắt đầu: {t.rowPrefix} ({t.rowCount} hàng x {t.seatsPerRow} ghế)</Text>
                          : <Text type="secondary">Vé tự do (Đứng)</Text>
                      }
                    ]}
                  />
                ),
                rowExpandable: (record) => record.tiers && record.tiers.length > 0,
              }}
              columns={[
                { 
                  title: 'Khu vực (Zone)', 
                  dataIndex: 'zoneName',
                  render: (name, record) => <Space><div style={{width: 12, height: 12, background: record.colorCode || '#ccc', borderRadius: '50%'}}></div> <b>{name}</b></Space>
                },
                { title: 'Giá gốc', dataIndex: 'price', render: (p, r) => `${p?.toLocaleString()} ${r.currency}` },
                { 
                  title: 'Loại vé', 
                  dataIndex: 'hasSeatMap', 
                  render: (hsm) => <Tag color={hsm ? "blue" : "purple"}>{hsm ? "Vé ngồi" : "Vé đứng"}</Tag> 
                },
                { 
                  title: 'Tình trạng', 
                  render: (_, r) => {
                    const total = r.totalSeats || 0;
                    const available = r.availableSeats || 0;
                    const booked = total - available;
                    return (
                      <Space direction="vertical" size={0}>
                        <Text strong>Tổng: {total}</Text>
                        <Text type="secondary">Đã đặt: {booked}</Text>
                        <Text type={available > 0 ? 'success' : 'danger'}>Còn: {available}</Text>
                      </Space>
                    );
                  }
                }
              ]} 
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConcertManagement;