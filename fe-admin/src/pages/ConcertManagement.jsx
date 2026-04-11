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

  // --- THUẬT TOÁN MỚI: TÍNH PREFIX THEO TỪNG ZONE (RESET KHI QUA ZONE MỚI) ---
  const getNextPrefixInZone = (zoneIndex) => {
    const zones = form.getFieldValue('zones') || [];
    const targetZone = zones[zoneIndex];
    
    // Nếu chưa có Tier nào trong Zone này, bắt đầu từ 'A'
    if (!targetZone || !targetZone.tiers || targetZone.tiers.length === 0) return 'A';

    let maxIndexInZone = 0;
    targetZone.tiers.forEach(t => {
      if (t && t.rowPrefix && t.rowCount) {
        const prefix = t.rowPrefix.toUpperCase();
        let startIndex = 0;
        for (let i = 0; i < prefix.length; i++) {
          startIndex = startIndex * 26 + (prefix.charCodeAt(i) - 64);
        }
        const endIndex = startIndex + t.rowCount - 1;
        if (endIndex > maxIndexInZone) maxIndexInZone = endIndex;
      }
    });

    let nextVal = maxIndexInZone + 1;
    let nextPrefix = '';
    while (nextVal > 0) {
      let mod = (nextVal - 1) % 26;
      nextPrefix = String.fromCharCode(65 + mod) + nextPrefix;
      nextVal = Math.floor((nextVal - mod) / 26);
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
        zones: values.zones?.map((z, i) => {
          const isSeated = z.hasSeatMap;
          let calculatedTotal = 0; 
          const mappedTiers = isSeated ? z.tiers?.map((t, j) => {
            const rCount = t.rowCount || 1;
            const sCount = t.seatsPerRow || 1;
            calculatedTotal += (rCount * sCount);
            return {
              ...t,
              tierName: t.tierName || 'STANDARD',
              displayOrder: j + 1,
              currency: z.currency || 'USDT',
              colorCode: z.colorCode || ZONE_COLORS[0].value,
              rowPrefix: t.rowPrefix?.toUpperCase(),
              rowCount: rCount,
              seatsPerRow: sCount
            };
          }) || [] : [];
          return {
            ...z,
            zoneName: z.zoneName?.trim() || `Khu vực ${i+1}`,
            displayOrder: i + 1,
            colorCode: z.colorCode || ZONE_COLORS[i % ZONE_COLORS.length].value,
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
      console.error("API Error: ", error.response?.data);
      const backendMsg = error.response?.data?.message || 'Có lỗi xảy ra!';
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
      message.error("Không thể lấy dữ liệu chi tiết!");
    } finally { setLoading(false); }
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
      render: (vId, record) => record.venueName || venues.find(v => (v.venueId || v.venue_id) === vId)?.name || 'Chưa cập nhật'
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
                zones: [{ 
                  zoneName: 'Khu vực 1', price: 10, currency: 'USDT', colorCode: ZONE_COLORS[0].value, 
                  hasSeatMap: true, 
                  tiers: [{ price: 10, rowPrefix: 'A', rowCount: 1, seatsPerRow: 2 }] 
                }] 
              });
              setModalState({ open: true, id: null }); 
            }}>Tạo Concert</Button>
          </Space>
        }
      >
        <Table columns={columns} dataSource={concerts} rowKey={(r) => r.concertId || r.id || Math.random()} loading={loading} pagination={pagination} onChange={(p) => fetchData(p.current, p.pageSize)} bordered scroll={{ x: 800 }} />
      </Card>

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
  {/* 1. Mở bán vé: Phải >= Hiện tại */}
  <Form.Item 
    name="saleStartAt" 
    label="Mở bán vé" 
    rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
  >
    <DatePicker 
      showTime 
      format="DD/MM/YYYY HH:mm" 
      style={{width:'100%'}} 
      disabledDate={(current) => current && current < dayjs().startOf('day')}
    />
  </Form.Item>

  {/* 2. Đóng bán vé: Phải sau Mở bán */}
  <Form.Item 
    name="saleEndAt" 
    label="Đóng bán vé" 
    dependencies={['saleStartAt']}
    rules={[
      { required: true, message: 'Vui lòng chọn thời gian!' },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || value.isAfter(getFieldValue('saleStartAt'))) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('Kết thúc bán phải SAU khi bắt đầu bán!'));
        },
      }),
    ]}
  >
    <DatePicker 
      showTime 
      format="DD/MM/YYYY HH:mm" 
      style={{width:'100%'}} 
      disabledDate={(current) => current && current < dayjs().startOf('day')}
    />
  </Form.Item>

  {/* 3. Ngày diễn: Phải sau Đóng bán */}
  <Form.Item 
    name="concertDate" 
    label="Ngày diễn" 
    dependencies={['saleEndAt']}
    rules={[
      { required: true, message: 'Vui lòng chọn thời gian!' },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || value.isAfter(getFieldValue('saleEndAt'))) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('Ngày diễn phải SAU khi đóng bán vé!'));
        },
      }),
    ]}
  >
    <DatePicker 
      showTime 
      format="DD/MM/YYYY HH:mm" 
      style={{width:'100%'}} 
      disabledDate={(current) => current && current < dayjs().startOf('day')}
    />
  </Form.Item>

  {/* 4. Kết thúc diễn: Phải sau Ngày diễn */}
  <Form.Item 
    name="endDate" 
    label="Kết thúc diễn" 
    dependencies={['concertDate']}
    rules={[
      { required: true, message: 'Vui lòng chọn thời gian!' },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || value.isAfter(getFieldValue('concertDate'))) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('Kết thúc diễn phải SAU khi bắt đầu diễn!'));
        },
      }),
    ]}
  >
    <DatePicker 
      showTime 
      format="DD/MM/YYYY HH:mm" 
      style={{width:'100%'}} 
      disabledDate={(current) => current && current < dayjs().startOf('day')}
    />
  </Form.Item>
</div>

          <Divider orientation="left">3. Xây dựng Sơ đồ & Giá vé</Divider>
          <Form.List name="zones">
            {(zoneFields, { add: addZone, remove: removeZone }) => (
              <>
                {zoneFields.map(({ key: zKey, name: zName, ...restZField }) => (
                  <Form.Item noStyle shouldUpdate key={zKey}>
                    {() => {
                      const currentZone = form.getFieldValue(['zones', zName]) || {};
                      const isZoneLocked = currentZone.totalSeats > 0 && currentZone.availableSeats < currentZone.totalSeats;
                      const hasSeatMap = currentZone.hasSeatMap;
                      const activeColor = currentZone.colorCode || '#d9d9d9';

                      return (
                        <Card 
                          size="small" 
                          style={{ 
                            marginBottom: 20, borderLeft: `6px solid ${activeColor}`,
                            background: isZoneLocked ? '#fff1f0' : '#fcfcfc',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }} 
                          title={<Space><b style={{fontSize: 16}}>Khu vực #{zName + 1}</b> {isZoneLocked && <Tag color="red">🔒 Đã bán vé - Khóa cấu trúc</Tag>}</Space>}
                          extra={!isZoneLocked && zoneFields.length > 1 && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeZone(zName)}>Xóa Khu vực</Button>}
                        >
                          <Form.Item {...restZField} name={[zName, 'zoneId']} hidden><Input /></Form.Item>
                          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', gap: '12px', marginTop: 8, marginBottom: 16 }}>
                            <Form.Item {...restZField} name={[zName, 'zoneName']} label="Tên Khu vực" rules={[{ required: true }]}><Input disabled={isZoneLocked} /></Form.Item>
                            <Form.Item {...restZField} name={[zName, 'price']} label="Giá gốc (Base)" rules={[{ required: true }]}><InputNumber disabled={isZoneLocked} min={0} style={{width:'100%'}} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
                            <Form.Item {...restZField} name={[zName, 'currency']} label="Tiền tệ" rules={[{ required: true }]}><Select disabled={isZoneLocked} options={[{value: 'USDT', label: 'USDT'},{value: 'ETH', label: 'ETH'},{value: 'BNB', label: 'BNB'}]} /></Form.Item>
                            <Form.Item {...restZField} name={[zName, 'colorCode']} label="Màu hiển thị" rules={[{ required: true }]}>
                              <Select disabled={isZoneLocked} options={ZONE_COLORS.map(c => ({ value: c.value, label: <Space><div style={{width: 12, height: 12, background: c.value, borderRadius: '50%'}}></div>{c.label}</Space> }))} />
                            </Form.Item>
                          </div>

                          <div style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #e8e8e8' }}>
                            <Form.Item {...restZField} name={[zName, 'hasSeatMap']} label="Tính chất Không gian" valuePropName="checked">
                              <Switch disabled={isZoneLocked} checkedChildren="🎫 VÉ NGỒI" unCheckedChildren="🏃 VÉ ĐỨNG" />
                            </Form.Item>

                            {!hasSeatMap ? (
                              <div style={{ background: '#e6f7ff', padding: 12, borderRadius: 6 }}>
                                <Form.Item {...restZField} name={[zName, 'totalSeats']} label="Tổng số vé bán ra" rules={[{ required: true }]}>
                                  <InputNumber disabled={isZoneLocked} min={1} style={{width:'30%'}} />
                                </Form.Item>
                              </div>
                            ) : (
                              <Form.List name={[zName, 'tiers']}>
                                {(tierFields, { add: addTier, remove: removeTier }) => (
                                  <>
                                    {tierFields.map(({ key: tKey, name: tName, ...restTField }, index) => (
                                      <div key={tKey} style={{ background: '#fafafa', padding: 12, marginBottom: 12, borderRadius: 6, border: '1px dashed #d9d9d9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                          <Text strong>📌 Phân Hạng (Tier) #{index + 1}</Text>
                                          {!isZoneLocked && tierFields.length > 1 && (
                                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeTier(tName)} size="small" />
                                          )}
                                        </div>
                                        <Form.Item {...restTField} name={[tName, 'tierId']} hidden><Input /></Form.Item>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                          <Form.Item {...restTField} name={[tName, 'tierName']} label="Tên Hạng" rules={[{ required: true }]}>
                                            <Select disabled={isZoneLocked} placeholder="-- Chọn hạng vé --">
                                              <Select.Option value="VIP">VIP</Select.Option>
                                              <Select.Option value="MID">MID</Select.Option>
                                              <Select.Option value="STANDARD">STANDARD</Select.Option>
                                            </Select>
                                          </Form.Item>
                                          <Form.Item {...restTField} name={[tName, 'price']} label="Giá hạng" rules={[{ required: true }]}><InputNumber disabled={isZoneLocked} min={0} style={{width:'100%'}} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                          <Form.Item {...restTField} name={[tName, 'rowPrefix']} label="Bắt đầu" rules={[{ required: true }]}>
                                            <Input disabled={isZoneLocked} style={{textTransform:'uppercase', fontWeight: 'bold'}} />
                                          </Form.Item>
                                          <Form.Item {...restTField} name={[tName, 'rowCount']} label="Số hàng" rules={[{ required: true }]}><InputNumber disabled={isZoneLocked} min={1} style={{width:'100%'}} /></Form.Item>
                                          <Form.Item {...restTField} name={[tName, 'seatsPerRow']} label="Ghế/Hàng" rules={[{ required: true }]}><InputNumber disabled={isZoneLocked} min={1} style={{width:'100%'}} /></Form.Item>
                                        </div>
                                      </div>
                                    ))}
                                    {!isZoneLocked && (
                                      <Button type="dashed" onClick={() => addTier({ price: currentZone.price || 0, rowPrefix: getNextPrefixInZone(zName), rowCount: 1, seatsPerRow: 2 })} block icon={<PlusOutlined />}>Thêm Phân Hạng</Button>
                                    )}
                                  </>
                                )}
                              </Form.List>
                            )}
                          </div>
                        </Card>
                      );
                    }}
                  </Form.Item>
                ))}
                <Button type="dashed" onClick={() => addZone({ zoneName: `Khu vực ${zoneFields.length + 1}`, price: 10, currency: 'USDT', colorCode: ZONE_COLORS[zoneFields.length % ZONE_COLORS.length].value, hasSeatMap: true, tiers: [{  price: 10, rowPrefix: 'A', rowCount: 1, seatsPerRow: 2 }] })} block icon={<PlusOutlined />} style={{ height: 40, borderColor: '#1890ff', color: '#1890ff' }}>
                  Thêm Khu Vực Mới
                </Button>
              </>
            )}
          </Form.List>

          <Divider orientation="left">4. Khác</Divider>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="bannerURL" label="Ảnh Banner"><Input /></Form.Item>
            <Form.Item name="status" label="Trạng thái"><Select options={['DRAFT', 'ON_SALE', 'COMPLETED', 'CANCELLED'].map(v => ({value:v, label:v}))} /></Form.Item>
          </div>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{height: 50, fontSize: 16}}>XÁC NHẬN</Button>
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