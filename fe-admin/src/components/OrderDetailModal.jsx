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
    } else {
      setData(null);
    }
  }, [open, orderId, onCancel]);

  const itemColumns = [
    { title: 'Khu vực', dataIndex: 'zoneName' },
    { title: 'Hạng vé', dataIndex: 'tierName', render: (t) => t || '-' },
    { title: 'Vị trí', dataIndex: 'seatLabel', render: (s) => s ? <Tag color="blue">{s}</Tag> : <Tag>Vé đứng</Tag> },
    { title: 'Đơn giá', dataIndex: 'unitPrice', render: (p) => `${p?.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${data?.currency}` },
    { title: 'Số lượng', dataIndex: 'quantity' },
    { title: 'Thành tiền', dataIndex: 'subtotal', render: (s) => <Text strong>{s?.toLocaleString(undefined, { maximumFractionDigits: 6 })} {data?.currency}</Text> },
  ];
  const getStatusColor = (status) => {
    const colors = { 'PAID': 'green', 'PENDING': 'blue', 'CANCELLED': 'red', 'NEED_REFUND': 'volcano', 'REFUNDED': 'purple' };
    return colors[status] || 'default';
  };
  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Chi tiết giao dịch: {orderId?.substring(0, 50)}</Title>}
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
              <Descriptions.Item label="Ví khách hàng" span={2}>
                {data.userWallet ? <Text copyable>{data.userWallet}</Text> : <Text type="secondary">N/A</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(data.orderStatus)}>{data.orderStatus}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{dayjs(data.createdAt).format('DD/MM/YYYY HH:mm:ss')}</Descriptions.Item>
              <Descriptions.Item label="Thanh toán lúc">{data.paidAt ? dayjs(data.paidAt).format('DD/MM/YYYY HH:mm:ss') : '---'}</Descriptions.Item>

              {/* 🚀 THÊM HIỂN THỊ MÃ GIAO DỊCH ĐỂ ĐỐI SOÁT */}
              <Descriptions.Item label="Mã giao dịch nạp (Mua)" span={2}>
                {data.paymentTxHash ? <Text copyable type="secondary">{data.paymentTxHash}</Text> : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Mã giao dịch trả (Hoàn tiền)" span={2}>
                {data.refundTxHash ? (
                  <a href={`https://sepolia.etherscan.io/tx/${data.refundTxHash}`} target="_blank" rel="noreferrer">
                    <Text strong type="success">{data.refundTxHash}</Text>
                  </a>
                ) : <Text italic type="secondary">Chưa hoàn tiền</Text>}
              </Descriptions.Item>

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
              <Text size="large">Tổng cộng: <Title level={3} style={{ display: 'inline', color: '#cf1322' }}>{data.totalAmount?.toLocaleString(undefined, { maximumFractionDigits: 6 })} {data.currency}</Title></Text>
            </div>
          </>
        )}
      </Spin>
    </Modal>
  );
};

export default OrderDetailModal;