import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Table, Tag, Typography, Divider, Spin, message } from 'antd';
import dayjs from 'dayjs';
import API from '../api/config';

const { Text, Title } = Typography;

const OrderDetailModal = ({ orderId, open, onCancel }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && orderId) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const res = await API.get(`/admin/orders/${orderId}`);
          setData(res.data);
        } catch {
          message.error("Không thể tải chi tiết đơn hàng!");
          onCancel();
        } finally { setLoading(false); }
      };
      fetchDetail();
    }
  }, [open, orderId, onCancel]);

  const itemColumns = [
    { title: 'Khu vực', dataIndex: 'zoneName' },
    { title: 'Hạng vé', dataIndex: 'tierName', render: (t) => t || '-' },
    { title: 'Vị trí', dataIndex: 'seatLabel', render: (s) => s ? <Tag color="blue">{s}</Tag> : <Tag>Vé đứng</Tag> },
    { title: 'Đơn giá', dataIndex: 'unitPrice', render: (p) => `${p?.toLocaleString()} ${data?.currency}` },
    { title: 'Số lượng', dataIndex: 'quantity' },
    { title: 'Thành tiền', dataIndex: 'subtotal', render: (s) => <Text strong>{s?.toLocaleString()} {data?.currency}</Text> },
  ];

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Chi tiết giao dịch: {orderId?.substring(0, 8)}</Title>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {data && (
          <>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Khách hàng"><b>{data.userName}</b> ({data.userEmail})</Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag color="green">{data.orderStatus}</Tag></Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{dayjs(data.createdAt).format('DD/MM/YYYY HH:mm:ss')}</Descriptions.Item>
              <Descriptions.Item label="Thanh toán lúc">{data.paidAt ? dayjs(data.paidAt).format('DD/MM/YYYY HH:mm:ss') : '---'}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>{data.note || 'Không có ghi chú'}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Vật phẩm trong đơn hàng (Tickets)</Divider>
            <Table 
              dataSource={data.items || []} 
              columns={itemColumns} 
              rowKey="orderItemId" 
              pagination={false} 
              size="small" 
              bordered
            />
            
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Text size="large">Tổng cộng: <Title level={3} style={{ display: 'inline', color: '#cf1322' }}>{data.totalAmount?.toLocaleString()} {data.currency}</Title></Text>
            </div>
          </>
        )}
      </Spin>
    </Modal>
  );
};

export default OrderDetailModal;