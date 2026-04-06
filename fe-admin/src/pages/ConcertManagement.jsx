import { useState, useEffect } from 'react';
import { 
  Table, Button, Space, message, Popconfirm, Modal, 
  Form, Input, DatePicker, Select, InputNumber, Divider, Card, Badge, Descriptions, Tag, Tooltip, Typography 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, ReloadOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import API from '../api/config';

dayjs.extend(customParseFormat);
const { Text } = Typography;

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

  // Hàm parse an toàn dành riêng cho định dạng DD/MM/YYYY trả về từ BE
  const parseApiDate = (dateStr) => {
    if (!dateStr || dateStr === 'null') return null;
    const d = dayjs(dateStr, API_DATE_FORMAT);
    return d.isValid() ? d : null;
  };

  // Trả về chuỗi an toàn để render UI
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

      // Bọc thép dữ liệu để không bao giờ bị sập màn hình trắng
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

  // XEM CHI TIẾT
  const handleViewDetail = async (id) => {
    setDetailModal({ open: true, data: null, loading: true });
    try {
      const res = await API.get(`/admin/concerts/${id}`);
      setDetailModal({ open: true, data: res.data?.data || res.data, loading: false });
    } catch (error) {
      message.error("Không thể lấy thông tin chi tiết!");
      setDetailModal({ open: false, data: null, loading: false });
    }
  };

  // TÍNH TOÁN KÝ TỰ DÃY TIẾP THEO (A -> B -> C) CHO NÚT THÊM ZONE
  const calculateNextPrefix = (zones) => {
    if (!zones || zones.length === 0) return 'A';
    const lastZone = zones[zones.length - 1];
    const prefix = (lastZone.rowPrefix || 'A').toString().toUpperCase();
    const rows = lastZone.rowCount || 0;
    
    let startIndex = 0;
    for (let i = 0; i < prefix.length; i++) {
      startIndex = startIndex * 26 + (prefix.charCodeAt(i) - 64);
    }
    startIndex -= 1; 
    let nextIndex = startIndex + rows;
    
    let nextPrefix = '';
    let temp = nextIndex;
    while (temp >= 0) {
      nextPrefix = String.fromCharCode((temp % 26) + 65) + nextPrefix;
      temp = Math.floor(temp / 26) - 1;
    }
    return nextPrefix;
  };

  // LƯU (CREATE / UPDATE)
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        concertDate: values.concertDate ? values.concertDate.toISOString() : null,
        endDate: values.endDate ? values.endDate.toISOString() : null,
        saleStartAt: values.saleStartAt ? values.saleStartAt.toISOString() : null,
        saleEndAt: values.saleEndAt ? values.saleEndAt.toISOString() : null,
        zones: values.zones?.map((z, i) => ({
          ...z,
          displayOrder: i + 1,
          hasSeatMap: true,
          colorCode: z.colorCode || '#FF0000',
          rowPrefix: z.rowPrefix?.toUpperCase(),
        })) || []
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
      const backendMsg = error.response?.data?.message || 'Vui lòng kiểm tra lại dữ liệu nhập!';
      message.error(`Lưu thất bại: ${backendMsg}`);
    } finally { setLoading(false); }
  };

  // MỞ FORM SỬA (TỰ ĐỘNG ĐIỀN DATA CŨ)
  const handleOpenEdit = (record) => {
    form.resetFields();
    form.setFieldsValue({
      ...record,
      concertDate: parseApiDate(record.concertDate),
      endDate: parseApiDate(record.endDate),
      saleStartAt: parseApiDate(record.saleStartAt),
      saleEndAt: parseApiDate(record.saleEndAt),
      zones: record.zones || []
    });
    setModalState({ open: true, id: record.concertId || record.id });
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
    { 
      title: 'Ngày diễn', dataIndex: 'concertDate', 
      render: (d) => formatSafeDate(d) 
    },
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
        message.success('Xóa concert thành công!'); // Thêm dòng thông báo này
        fetchData(pagination.current);
      }).catch(() => message.error('Xóa concert thất bại!'))}>
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ) 
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card 
        title={<h2 style={{ margin: 0 }}>Quản lý Concert</h2>} 
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchData(pagination.current)}>Làm mới</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalState({ open: true, id: null }); }}>Tạo mới</Button>
          </Space>
        }
      >
        <Table columns={columns} dataSource={concerts} rowKey={(r) => r.concertId || r.id || Math.random()} loading={loading} pagination={pagination} onChange={(p) => fetchData(p.current, p.pageSize)} bordered scroll={{ x: 800 }} />
      </Card>

      {/* ========================================================== */}
      {/* MODAL THÊM / SỬA CONCERT & ZONES */}
      {/* ========================================================== */}
      <Modal 
        title={modalState.id ? "SỬA THÔNG TIN CONCERT" : "TẠO CONCERT MỚI"} 
        open={modalState.open} 
        onCancel={() => setModalState({ open: false, id: null })} 
        footer={null} 
        width={1050} 
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleFinish} initialValues={{ status: 'DRAFT', zones: [{ rowPrefix: 'A', rowCount: 1, seatsPerRow: 20, currency: 'VND', colorCode: '#FF0000' }] }}>
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

          <Divider orientation="left">3. Cấu trúc Khu vực (Zones)</Divider>
          <Form.List name="zones">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card size="small" key={key} style={{ marginBottom: 16, background: '#f8fbff', borderColor: '#bae0ff' }} 
                    title={
                      <Space>Khu vực #{name + 1} 
                        <Form.Item noStyle shouldUpdate>{() => <Tag color="green">Tổng: {(form.getFieldValue(['zones', name, 'rowCount']) || 0) * (form.getFieldValue(['zones', name, 'seatsPerRow']) || 0)} ghế</Tag>}</Form.Item>
                      </Space>
                    }
                    extra={fields.length > 1 && <Button type="link" danger onClick={() => remove(name)}>Xóa khu vực này</Button>}
                  >
                    <Form.Item {...restField} name={[name, 'zoneId']} hidden><Input /></Form.Item>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '12px' }}>
                      <Form.Item {...restField} name={[name, 'zoneName']} label="Tên Khu vực" rules={[{ required: true }]}><Input /></Form.Item>
                      <Form.Item {...restField} name={[name, 'price']} label="Giá vé" rules={[{ required: true }]}><InputNumber min={0} style={{width:'100%'}} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
                      <Form.Item {...restField} name={[name, 'currency']} label="Tiền tệ" rules={[{ required: true }]}><Select options={[{value: 'VND', label: 'VND'}, {value: 'USDT', label: 'USDT'}]} /></Form.Item>
                      
                      <Form.Item {...restField} name={[name, 'colorCode']} label="Màu Sơ đồ" rules={[{ required: true }]}>
                        <Select options={[
                          { value: '#FF0000', label: <Space><div style={{width: 12, height: 12, background: '#FF0000', borderRadius: '50%'}}></div>Đỏ</Space> },
                          { value: '#1890FF', label: <Space><div style={{width: 12, height: 12, background: '#1890FF', borderRadius: '50%'}}></div>Xanh dương</Space> },
                          { value: '#52C41A', label: <Space><div style={{width: 12, height: 12, background: '#52C41A', borderRadius: '50%'}}></div>Xanh lá</Space> },
                          { value: '#FAAD14', label: <Space><div style={{width: 12, height: 12, background: '#FAAD14', borderRadius: '50%'}}></div>Vàng</Space> },
                          { value: '#000000', label: <Space><div style={{width: 12, height: 12, background: '#000000', borderRadius: '50%'}}></div>Đen</Space> }
                        ]} />
                      </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: '#e6f4ff', padding: 12, borderRadius: 6 }}>
                      <Form.Item {...restField} name={[name, 'rowPrefix']} label="Ký tự bắt đầu" rules={[{ required: true }]}><Input style={{ textTransform: 'uppercase', fontWeight: 'bold' }} /></Form.Item>
                      <Form.Item {...restField} name={[name, 'rowCount']} label="Tổng số hàng" rules={[{ required: true }]}><InputNumber min={1} style={{width:'100%'}} /></Form.Item>
                      <Form.Item {...restField} name={[name, 'seatsPerRow']} label="Số ghế / 1 hàng" rules={[{ required: true }]}><InputNumber min={1} style={{width:'100%'}} /></Form.Item>
                    </div>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add({ rowPrefix: calculateNextPrefix(form.getFieldValue('zones')), rowCount: 1, seatsPerRow: 20, currency: 'VND', colorCode: '#1890FF' })} block icon={<PlusOutlined />} style={{ height: 40 }}>
                  Thêm Khu Vực Mới (Tự động nối ký tự)
                </Button>
              </>
            )}
          </Form.List>

          <Divider orientation="left">4. Khác</Divider>
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

      {/* ========================================================== */}
      {/* MODAL CHI TIẾT ĐẦY ĐỦ */}
      {/* ========================================================== */}
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
              columns={[
                { 
                  title: 'Khu vực (Zone)', 
                  dataIndex: 'zoneName',
                  render: (name, record) => <Space><div style={{width: 12, height: 12, background: record.colorCode || '#ccc', borderRadius: '50%'}}></div> <b>{name}</b></Space>
                },
                { title: 'Giá vé', dataIndex: 'price', render: (p, r) => `${p?.toLocaleString()} ${r.currency}` },
                // { 
                //   title: 'Cấu trúc Ghế', 
                //   render: (_, r) => <Space direction="vertical" size={0}>
                //     <Text type="secondary">Bắt đầu: <Tag color="blue">{r.rowPrefix}</Tag></Text>
                //     <Text type="secondary">Hàng x Ghế: {r.rowCount} x {r.seatsPerRow}</Text>
                //   </Space>
                // },
                { 
                  title: 'Tình trạng ghế', 
                  render: (_, r) => {
                    const total = r.totalSeats || 0;
                    const available = r.availableSeats || 0;
                    const booked = total - available;
                    return (
                      <Space direction="vertical" size={0}>
                        <Text strong>Tổng: {total}</Text>
                        <Text type="secondary">Đã đặt: {booked}</Text>
                        <Text type={available > 0 ? 'success' : 'danger'}>Còn trống: {available}</Text>
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