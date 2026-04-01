import { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, Modal, Form, Input, Select, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import API from '../api/config';

const TicketManagement = () => {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [tickets, setTickets] = useState([]); // Lưu danh sách Vé
  const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu
  const [modalState, setModalState] = useState({ open: false, id: null }); // Trạng thái Modal
  const [form] = Form.useForm();

  // --- HÀM 1: LẤY DANH SÁCH VÉ TỪ BACKEND ---
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/tickets');
      setTickets(data?.content || data?.data?.content || data?.data || data || []);
    } catch {
      message.error('Lỗi tải danh sách Vé!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  // --- HÀM 2: XÓA VÉ ---
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await API.delete(`/admin/tickets/${id}`);
      message.success('Đã xóa vé thành công!');
      fetchTickets();
    } catch {
      message.error('Lỗi khi xóa!');
      setLoading(false);
    }
  };

  // --- HÀM 3: XỬ LÝ LƯU FORM (THÊM / SỬA) ---
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      if (modalState.id) await API.put(`/admin/tickets/${modalState.id}`, values);
      else await API.post('/admin/tickets', values);
      
      message.success('Lưu thông tin thành công!');
      setModalState({ open: false, id: null });
      fetchTickets();
    } catch {
      message.error('Lỗi lưu dữ liệu!');
      setLoading(false);
    }
  };

  // --- HÀM 4: MỞ MODAL ---
  const openModal = (record = null) => {
    form.resetFields(); // Xóa trắng form
    if (record) form.setFieldsValue(record); // Nạp data nếu là chế độ Sửa
    setModalState({ open: true, id: record?.ticketId || null });
  };

  // --- CẤU HÌNH CỘT CHO BẢNG ---
  const columns = [
    { title: 'Token', dataIndex: 'tokenId', render: (t) => t ? <Tag color="blue">{t.slice(0, 8)}...</Tag> : 'N/A' },
    { title: 'Đêm diễn', dataIndex: 'concertTitle' },
    { title: 'Khu vực', dataIndex: 'zoneName' },
    { title: 'Ghế', dataIndex: 'seatLabel' },
    { title: 'Ví', dataIndex: 'walletAddress', render: (v) => v ? `${v.slice(0, 8)}...` : '' }, // Cắt bớt độ dài chuỗi ví
    { title: 'Ngày mua', dataIndex: 'purchaseDate', render: (d) => d && dayjs(d).format('DD/MM/YYYY HH:mm') },
    { title: 'Trạng thái', dataIndex: 'status', render: (s) => {
        // Ánh xạ màu sắc cho các trạng thái vé chuẩn từ Database
        const colors = { MINTING: 'purple', ACTIVE: 'green', USED: 'gray', TRANSFERRED: 'orange', CANCELLED: 'red' };
        return <Tag color={colors[s] || 'default'}>{s}</Tag>;
    }},
    { title: 'Hành động', render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} onClick={() => openModal(r)}>Sửa</Button>
        <Popconfirm title="Chắc chắn xóa vé này?" onConfirm={() => handleDelete(r.ticketId)}>
          <Button danger icon={<DeleteOutlined />}>Xóa</Button>
        </Popconfirm>
      </Space>
    )}
  ];

  // --- GIAO DIỆN CHÍNH ---
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý Vé</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Tạo Vé Mới</Button>
      </div>
      
      {/* Khóa chính của bảng là ticketId */}
      <Table columns={columns} dataSource={tickets} rowKey="ticketId" loading={loading} bordered />

      <Modal title={modalState.id ? "Sửa Vé" : "Tạo Vé Cấp Tốc"} open={modalState.open} onCancel={() => setModalState({ open: false, id: null })} footer={null} width={700}>
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="walletAddress" label="Địa chỉ ví" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="userId" label="User ID" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="concertId" label="Concert ID" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="zoneId" label="Zone ID" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="seatId" label="Seat ID"><Input /></Form.Item>
            <Form.Item name="orderId" label="Order ID" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="orderItemId" label="Order Item ID" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="paymentId" label="Payment ID" rules={[{ required: true }]}><Input /></Form.Item>
            
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select options={['MINTING', 'ACTIVE', 'USED', 'TRANSFERRED', 'CANCELLED'].map(v => ({ value: v, label: v }))} />
            </Form.Item>
          </div>
          <Button type="primary" htmlType="submit" block loading={loading}>Lưu dữ liệu</Button>
        </Form>
      </Modal>
    </>
  );
};

export default TicketManagement;