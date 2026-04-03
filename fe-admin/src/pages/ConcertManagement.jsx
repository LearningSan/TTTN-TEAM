import { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, Modal, Form, Input, DatePicker, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import API from '../api/config';
import { getUserId } from '../utils/auth';
dayjs.extend(customParseFormat);
const ConcertManagement = () => {
  const [concerts, setConcerts] = useState([]);
  const [venues, setVenues] = useState([]); // Danh sách địa điểm cho Combobox
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({ open: false, id: null });
  const [form] = Form.useForm();
const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  // --- LẤY DỮ LIỆU TỪ API ---
  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      // Truyền tham số page và size lên BE
      const [resConcerts, resVenues] = await Promise.all([
        API.get(`/admin/concerts?page=${page - 1}&size=${pageSize}`),
        API.get('/admin/venues')
      ]);

      const concertData = resConcerts.data;
      setConcerts(concertData.content || concertData || []);
      setVenues(resVenues.data || []);

      // Cập nhật lại tổng số record để Ant Design vẽ số trang
      if (concertData.totalElements !== undefined) {
        setPagination({
          current: page,
          pageSize: pageSize,
          total: concertData.totalElements // Tổng số record BE trả về
        });
      }
    } catch (error) {
      message.error('Lỗi tải dữ liệu hệ thống!');
    } finally {
      setLoading(false);
    }
  };
const handleTableChange = (newPagination) => {
  fetchData(newPagination.current, newPagination.pageSize);
};
  // Cập nhật useEffect gọi fetchData không tham số (mặc định lấy trang 1)
  useEffect(() => { fetchData(1, pagination.pageSize); }, []);

  // --- XỬ LÝ XÓA (Dùng concertId từ Swagger) ---
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await API.delete(`/admin/concerts/${id}`);
      message.success('Đã xóa thành công!');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi xóa!');
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ LƯU (THÊM / SỬA) ---
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        organizerId: getUserId(), // Lấy ID admin đang login làm bên tổ chức[cite: 3]
        // Định dạng ISO chuẩn: 2026-03-31T16:03:32.235Z[cite: 3]
        concertDate: values.concertDate?.toISOString(),
        endDate: values.endDate?.toISOString(),
        saleStartAt: values.saleStartAt?.toISOString(),
        saleEndAt: values.saleEndAt?.toISOString(),
      };

      if (modalState.id) {
        // PUT /admin/concerts/{concertId}[cite: 3]
        await API.put(`/admin/concerts/${modalState.id}`, payload);
        message.success('Cập nhật thành công!');
      } else {
        // POST /admin/concerts[cite: 3]
        await API.post('/admin/concerts', payload);
        message.success('Thêm mới thành công!');
      }
      
      setModalState({ open: false, id: null });
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi lưu dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (record = null) => {
    form.resetFields();
    if (record) {
      const formatFromAPI = "DD/MM/YYYY HH:mm:ss";
      form.setFieldsValue({
        ...record,
        // Chuyển chuỗi ngày về object dayjs để DatePicker hiển thị được[cite: 3]
        concertDate: record.concertDate ? dayjs(record.concertDate, formatFromAPI) : null,
        endDate: record.endDate ? dayjs(record.endDate, formatFromAPI) : null,
        saleStartAt: record.saleStartAt ? dayjs(record.saleStartAt, formatFromAPI) : null,
        saleEndAt: record.saleEndAt ? dayjs(record.saleEndAt, formatFromAPI) : null,
        // venueId sẽ tự khớp với Select nhờ ID[cite: 3]
      });
    }
    setModalState({ open: true, id: record?.concertId || null });
  };

  const columns = [
    { 
      title: 'Banner', 
      dataIndex: 'bannerURL', 
      key: 'bannerURL',
      width: 120, // Giới hạn độ rộng cột ảnh
      render: (url) => (
        <div style={{ width: '100px', height: '60px', overflow: 'hidden', borderRadius: '4px', border: '1px solid #f0f0f0' }}>
          {url ? (
            <img 
              src={url} 
              alt="concert-banner" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              // Nếu link ảnh lỗi thì hiện ảnh mặc định
              onError={(e) => { e.target.src = 'https://via.placeholder.com/100x60?text=No+Image'; }}
            />
          ) : (
            <div style={{ background: '#f5f5f5', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>
              No Image
            </div>
          )}
        </div>
      )
    },
    { title: 'Tên Concert', dataIndex: 'title' },
    { title: 'Nghệ sĩ', dataIndex: 'artist' },
    { title: 'Địa điểm', dataIndex: 'venueName' },
    { 
      title: 'Ngày diễn', 
      dataIndex: 'concertDate', 
      // --- BƯỚC 4: XỬ LÝ HIỂN THỊ BẢNG ---
      render: (d) => {
        if (!d) return 'N/A';
        // Truyền thẳng format BE vào tham số thứ 2
        const date = dayjs(d, "DD/MM/YYYY HH:mm:ss"); 

        return date.isValid() 
          ? date.format('DD/MM/YYYY HH:mm') 
          : <span style={{ color: 'red' }}>Lỗi parse: {d}</span>;
      }
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (s) => <b style={{ color: s === 'ON_SALE' ? 'green' : 'gray' }}>{s}</b> 
    },
    { 
      title: 'Hành động', 
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(r)}>Sửa</Button>
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(r.concertId)}>
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ) 
    }
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý Concert</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Tạo Concert</Button>
      </div>
      
      <Table 
  columns={columns} 
  dataSource={concerts} 
  rowKey="concertId" 
  loading={loading} 
  bordered 
  // Gắn pagination và sự kiện onChange vào đây:
  pagination={pagination}
  onChange={handleTableChange}
/>

      <Modal 
        title={modalState.id ? "Cập nhật Concert" : "Thiết lập Concert Mới"} 
        open={modalState.open} 
        onCancel={() => setModalState({ open: false, id: null })} 
        footer={null} 
        width={800}
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="title" label="Tên chương trình" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="artist" label="Nghệ sĩ" rules={[{ required: true }]}><Input /></Form.Item>
            
            {/* COMBOBOX ĐỊA ĐIỂM (VENUE)[cite: 3] */}
            <Form.Item name="venueId" label="Địa điểm tổ chức" rules={[{ required: true }]}>
              <Select placeholder="Chọn địa điểm diễn ra">
                {venues.map(v => (
                  <Select.Option key={v.venueId} value={v.venueId}>
                    {v.venueName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select options={['DRAFT', 'ON_SALE', 'SOLD_OUT', 'COMPLETED', 'CANCELLED'].map(v => ({ value: v, label: v }))} />
            </Form.Item>

            <Form.Item name="concertDate" label="Ngày diễn" rules={[{ required: true }]}><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true }]}><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="saleStartAt" label="Mở bán vé"><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="saleEndAt" label="Đóng bán vé"><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
          </div>
          
          <Form.Item name="bannerURL" label="Link ảnh Banner"><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả chi tiết"><Input.TextArea rows={3} /></Form.Item>
          
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Lưu thông tin Concert
          </Button>
        </Form>
      </Modal>
    </>
  );
};

export default ConcertManagement;