import { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, Modal, Form, Input, DatePicker, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import API from '../api/config';

const ConcertManagement = () => {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [concerts, setConcerts] = useState([]); // Lưu danh sách concert
  const [loading, setLoading] = useState(false); // Quản lý trạng thái xoay xoay (loading)
  const [modalState, setModalState] = useState({ open: false, id: null }); // Quản lý ẩn/hiện Modal Thêm/Sửa
  const [form] = Form.useForm();

  // --- HÀM 1: LẤY DANH SÁCH TỪ BACKEND ---
  const fetchConcerts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/concerts');
      console.log("Dữ liệu Concert nhận được:", data);
      // Bóc tách mảng dữ liệu dù BE bọc trong data.content hay data.data
      setConcerts(data?.content || data?.data?.content || data?.data || data || []);
    } catch(error) {
      console.error("Chi tiết lỗi Concert:", error.response?.data || error.message);
      message.error('Lỗi tải danh sách Concert!');
    } finally {
      setLoading(false);
    }
  };

  // Chạy tự động lần đầu khi vào trang
  useEffect(() => { fetchConcerts(); }, []);

  // --- HÀM 2: XÓA 1 CONCERT ---
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await API.delete(`/admin/concerts/${id}`);
      message.success('Đã xóa thành công!');
      fetchConcerts(); // Tải lại bảng sau khi xóa
    } catch {
      message.error('Lỗi khi xóa!');
      setLoading(false);
    }
  };

  // --- HÀM 3: XỬ LÝ LƯU FORM (THÊM / SỬA) ---
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      // Ép kiểu thời gian từ thư viện dayjs sang chuỗi ISO để gửi cho Backend
      const payload = {
        ...values,
        concertDate: values.concertDate?.toISOString(),
        endDate: values.endDate?.toISOString(),
        saleStartAt: values.saleStartAt?.toISOString(),
        saleEndAt: values.saleEndAt?.toISOString(),
      };

      // Nếu có id (đang sửa) thì gọi PUT, nếu không (thêm mới) thì gọi POST
      if (modalState.id) await API.put(`/admin/concerts/${modalState.id}`, payload);
      else await API.post('/admin/concerts', payload);
      
      message.success('Lưu dữ liệu thành công!');
      setModalState({ open: false, id: null }); // Đóng modal
      fetchConcerts(); // Tải lại bảng
    } catch {
      message.error('Lỗi lưu dữ liệu!');
      setLoading(false);
    }
  };

  // --- HÀM 4: MỞ MODAL & NẠP DỮ LIỆU CŨ (NẾU CÓ) ---
  const openModal = (record = null) => {
    form.resetFields(); // Làm sạch form trước
    if (record) {
      // Đổ dữ liệu cũ vào form (phải convert chuỗi ISO về dayjs cho DatePicker hiểu)
      form.setFieldsValue({
        ...record,
        concertDate: record.concertDate ? dayjs(record.concertDate) : null,
        endDate: record.endDate ? dayjs(record.endDate) : null,
        saleStartAt: record.saleStartAt ? dayjs(record.saleStartAt) : null,
        saleEndAt: record.saleEndAt ? dayjs(record.saleEndAt) : null,
      });
    }
    setModalState({ open: true, id: record?.concertId || null });
  };

  // --- CẤU HÌNH CÁC CỘT CHO BẢNG ---
  const columns = [
    { title: 'Tên Concert', dataIndex: 'title' },
    { title: 'Nghệ sĩ', dataIndex: 'artist' },
    { title: 'Địa điểm', dataIndex: 'venueName' },
    { title: 'Ngày diễn ra', dataIndex: 'concertDate', render: (d) => d && dayjs(d).format('DD/MM/YYYY HH:mm') },
    { title: 'Trạng thái', dataIndex: 'status', render: (s) => <span style={{ fontWeight: 'bold', color: s === 'ON_SALE' ? 'green' : s === 'DRAFT' ? 'gray' : 'red' }}>{s}</span> },
    { title: 'Hành động', render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} onClick={() => openModal(r)}>Sửa</Button>
        <Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleDelete(r.concertId)}>
          <Button danger icon={<DeleteOutlined />}>Xóa</Button>
        </Popconfirm>
      </Space>
    )}
  ];

  // --- GIAO DIỆN CHÍNH ---
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý Concert</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm Concert</Button>
      </div>
      
      {/* Khóa chính của bảng là concertId */}
      <Table columns={columns} dataSource={concerts} rowKey="concertId" loading={loading} bordered />

      {/* Modal bật lên khi ấn Thêm hoặc Sửa */}
      <Modal title={modalState.id ? "Sửa Concert" : "Thêm Concert"} open={modalState.open} onCancel={() => setModalState({ open: false, id: null })} footer={null} width={700}>
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="title" label="Tên Concert" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="artist" label="Nghệ sĩ" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="concertDate" label="Ngày bắt đầu" rules={[{ required: true }]}><DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true }]}><DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="saleStartAt" label="Bắt đầu bán vé" rules={[{ required: true }]}><DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="saleEndAt" label="Kết thúc bán vé" rules={[{ required: true }]}><DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="venueId" label="Mã địa điểm" rules={[{ required: true }]}><Input /></Form.Item>
            
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              {/* Sinh ra các lựa chọn Select từ mảng cấu hình chuẩn của DB */}
              <Select options={['DRAFT', 'ON_SALE', 'SOLD_OUT', 'COMPLETED', 'CANCELLED'].map(v => ({ value: v, label: v }))} />
            </Form.Item>
          </div>
          <Form.Item name="bannerURL" label="Banner URL"><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Lưu dữ liệu</Button>
        </Form>
      </Modal>
    </>
  );
};

export default ConcertManagement;