import { useState, useEffect } from 'react';
import { 
  Table, Button, Space, message, Popconfirm, Modal, 
  Form, Input, DatePicker, Select, InputNumber, Divider, Card, Badge, Descriptions, Tag, Tooltip 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import API from '../api/config';

dayjs.extend(customParseFormat);

// Định dạng chuẩn khớp với @JsonFormat trên Backend[cite: 9, 12]
const BE_DATE_FORMAT = "DD/MM/YYYY HH:mm:ss";

const ConcertManagement = () => {
  const [concerts, setConcerts] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({ open: false, id: null });
  const [detailModal, setDetailModal] = useState({ open: false, data: null });
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 1. Load danh sách concert & địa điểm[cite: 8]
  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const [resConcerts, resVenues] = await Promise.all([
        API.get(`/admin/concerts?page=${page - 1}&size=${pageSize}`),
        API.get('/admin/venues')
      ]);
      const concertData = resConcerts.data;
      setConcerts(concertData.content || (Array.isArray(concertData) ? concertData : []));
      setVenues(Array.isArray(resVenues.data) ? resVenues.data : []);
      if (concertData.totalElements !== undefined) {
        setPagination(prev => ({ ...prev, current: page, total: concertData.totalElements }));
      }
    } catch (error) {
      message.error('Lỗi tải dữ liệu hệ thống!');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Logic UX: Tự động tính toán Row Prefix tiếp theo cho Zone[cite: 17]
  const calculateNextPrefix = (zones) => {
    if (!zones || zones.length === 0) return 'A';
    const lastZone = zones[zones.length - 1];
    const prefix = (lastZone.rowPrefix || 'A').toUpperCase();
    const rows = lastZone.rowCount || 0;
    const lastCharCode = prefix.charCodeAt(prefix.length - 1);
    const nextCharCode = lastCharCode + rows;
    return prefix.slice(0, -1) + String.fromCharCode(nextCharCode);
  };

  // 3. Xử lý Thêm / Sửa concert[cite: 8, 11]
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        concertDate: values.concertDate?.format(BE_DATE_FORMAT),
        endDate: values.endDate?.format(BE_DATE_FORMAT),
        saleStartAt: values.saleStartAt?.format(BE_DATE_FORMAT),
        saleEndAt: values.saleEndAt?.format(BE_DATE_FORMAT),
        zones: values.zones.map((z, i) => ({
          ...z,
          displayOrder: i + 1,
          hasSeatMap: true,
          status: 'ACTIVE'
        }))
      };

      if (modalState.id) {
        await API.put(`/admin/concerts/${modalState.id}`, payload);
        message.success('Cập nhật thành công!');
      } else {
        await API.post('/admin/concerts', payload);
        message.success('Tạo mới thành công!');
      }
      setModalState({ open: false, id: null });
      fetchData(pagination.current);
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi lưu dữ liệu!');
    } finally { setLoading(false); }
  };

  const columns = [
    { 
      title: 'Banner', 
      dataIndex: 'bannerURL', 
      width: 100,
      render: (url) => <img src={url} style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 4 }} alt="banner" onError={(e) => e.target.src='https://placehold.co/80x45?text=No+Img'} />
    },
    { title: 'Tên Concert', dataIndex: 'title', ellipsis: true },
    { title: 'Nghệ sĩ', dataIndex: 'artist' },
    { title: 'Địa điểm', dataIndex: 'venueName' },
    { 
      title: 'Ngày diễn', 
      dataIndex: 'concertDate', 
      render: (d) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : 'N/A' 
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      width: 120,
      render: (status) => {
        let color = 'default';
        if (status === 'ON_SALE') color = 'green';
        if (status === 'DRAFT') color = 'blue';
        if (status === 'CANCELLED') color = 'red';
        if (status === 'COMPLETED') color = 'gray';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    { 
      title: 'Hành động', 
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailModal({ open: true, data: r })} />
          </Tooltip>
          <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => {
            form.setFieldsValue({
              ...r,
              concertDate: r.concertDate ? dayjs(r.concertDate) : null,
              endDate: r.endDate ? dayjs(r.endDate) : null,
              saleStartAt: r.saleStartAt ? dayjs(r.saleStartAt) : null,
              saleEndAt: r.saleEndAt ? dayjs(r.saleEndAt) : null,
              zones: r.zones
            });
            setModalState({ open: true, id: r.concertId });
          }}>Sửa</Button>
          <Popconfirm title="Xóa concert?" onConfirm={() => API.delete(`/admin/concerts/${r.concertId}`).then(() => fetchData())}>
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ) 
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title={<h2>Quản lý Concert</h2>} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalState({ open: true, id: null }); }}>Tạo mới</Button>}>
        <Table columns={columns} dataSource={concerts} rowKey="concertId" loading={loading} pagination={pagination} onChange={(p) => fetchData(p.current, p.pageSize)} bordered />
      </Card>

      {/* MODAL THÊM / SỬA[cite: 16] */}
      <Modal title={modalState.id ? "SỬA CONCERT" : "TẠO CONCERT"} open={modalState.open} onCancel={() => setModalState({ open: false, id: null })} footer={null} width={1000} destroyOnClose>
        <Form layout="vertical" form={form} onFinish={handleFinish} initialValues={{ zones: [{ rowPrefix: 'A', rowCount: 1, seatsPerRow: 10, currency: 'ETH' }] }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
            <Form.Item name="title" label="Tên chương trình" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="artist" label="Nghệ sĩ" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="venueId" label="Địa điểm" rules={[{ required: true }]}>
              <Select showSearch optionFilterProp="label" options={venues.map(v => ({ value: v.venueId, label: v.name || v.venueName }))} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
            <Form.Item name="concertDate" label="Ngày diễn" rules={[{ required: true }]}><DatePicker showTime format={BE_DATE_FORMAT} style={{width:'100%'}} /></Form.Item>
            <Form.Item name="endDate" label="Kết thúc diễn" rules={[{ required: true }]}><DatePicker showTime format={BE_DATE_FORMAT} style={{width:'100%'}} /></Form.Item>
            <Form.Item name="saleStartAt" label="Mở bán vé" rules={[{ required: true }]}><DatePicker showTime format={BE_DATE_FORMAT} style={{width:'100%'}} /></Form.Item>
            <Form.Item name="saleEndAt" label="Đóng bán vé" rules={[{ required: true }]}><DatePicker showTime format={BE_DATE_FORMAT} style={{width:'100%'}} /></Form.Item>
          </div>

          <Divider orientation="left">VÙNG GIÁ & GHẾ (Dãy tự tăng)</Divider>
          
          <Form.List name="zones">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card size="small" key={key} style={{ marginBottom: 12, background: '#fafafa' }} 
                    title={<Space>Zone #{name + 1} <Form.Item noStyle shouldUpdate>{() => <Tag color="blue">{(form.getFieldValue(['zones', name, 'rowCount']) || 0) * (form.getFieldValue(['zones', name, 'seatsPerRow']) || 0)} ghế</Tag>}</Form.Item></Space>}
                    extra={<Button type="link" danger onClick={() => remove(name)}>Xóa</Button>}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', gap: '10px' }}>
                      <Form.Item {...restField} name={[name, 'zoneName']} label="Tên Zone" rules={[{ required: true }]}><Input /></Form.Item>
                      <Form.Item {...restField} name={[name, 'price']} label="Giá" rules={[{ required: true }]}><InputNumber min={0} style={{width:'100%'}} /></Form.Item>
                      <Form.Item {...restField} name={[name, 'currency']} label="Loại tiền" rules={[{ required: true }]}>
                        <Select options={['ETH', 'USDT', 'BNB'].map(c => ({value: c, label: c}))} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'rowPrefix']} label="Dãy" rules={[{ required: true }]}><Input /></Form.Item>
                      <Form.Item {...restField} name={[name, 'rowCount']} label="Số hàng" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item>
                      <Form.Item {...restField} name={[name, 'seatsPerRow']} label="Ghế/Hàng" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item>
                    </div>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add({ rowPrefix: calculateNextPrefix(form.getFieldValue('zones')), rowCount: 1, seatsPerRow: 10, currency: 'ETH' })} block icon={<PlusOutlined />}>Thêm Zone</Button>
              </>
            )}
          </Form.List>

          <Form.Item name="bannerURL" label="Banner URL"><Input /></Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="DRAFT"><Select options={['DRAFT', 'ON_SALE', 'COMPLETED', 'CANCELLED'].map(v => ({value:v, label:v}))} /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{height: 50}}>XÁC NHẬN LƯU</Button>
        </Form>
      </Modal>

      {/* MODAL CHI TIẾT ĐẦY ĐỦ[cite: 16] */}
      <Modal title={<b style={{fontSize: 20}}>CHI TIẾT: {detailModal.data?.title}</b>} open={detailModal.open} onCancel={() => setDetailModal({ open: false, data: null })} footer={null} width={850}>
        {detailModal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Nghệ sĩ">{detailModal.data.artist}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag color="blue">{detailModal.data.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="Địa điểm" span={2}>{detailModal.data.venueName}</Descriptions.Item>
              <Descriptions.Item label="Ngày diễn">{dayjs(detailModal.data.concertDate).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">{dayjs(detailModal.data.endDate).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Mở bán vé">{dayjs(detailModal.data.saleStartAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Đóng bán vé">{dayjs(detailModal.data.saleEndAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>{detailModal.data.description}</Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Danh sách Zone ({detailModal.data.zones?.length || 0})</Divider>
            <Table dataSource={detailModal.data.zones} rowKey="zoneId" pagination={false} size="small" columns={[
              { title: 'Tên Zone', dataIndex: 'zoneName' },
              { title: 'Giá', dataIndex: 'price', render: (p, r) => `${p} ${r.currency}` },
              { title: 'Tổng ghế', dataIndex: 'totalSeats' },
              { title: 'Còn lại', dataIndex: 'availableSeats' },
            ]} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConcertManagement;