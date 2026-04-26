import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Spin, message, Typography } from 'antd';
import dayjs from 'dayjs'; // 🚀 Đã được sử dụng ở bên dưới
import API from '../api/config';

const { Text, Title } = Typography;

const TicketInvoiceModal = ({ ticketId, open, onCancel }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🚀 FIX LỖI: Đưa hàm fetch vào trong useEffect để tránh lỗi Missing Dependency
  useEffect(() => {
    const fetchTicketDetail = async (id) => {
      setLoading(true);
      try {
        const res = await API.get(`/admin/tickets/${id}`);
        setData(res.data);
      } catch {
        message.error("Không thể tải chi tiết hóa đơn!");
        onCancel();
      } finally {
        setLoading(false);
      }
    };

    if (open && ticketId) {
      fetchTicketDetail(ticketId);
    } else {
      setData(null);
    }
  }, [open, ticketId, onCancel]); // Đưa onCancel vào mảng dependency cho chuẩn React Hook

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Chi tiết Hóa đơn / Vé</Title>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* THÔNG TIN NGƯỜI MUA */}
            <Descriptions title="👤 Thông tin Khách hàng (Buyer Info)" bordered size="small" column={2}>
              <Descriptions.Item label="Tên khách hàng"><Text strong>{data.buyerInfo?.name}</Text></Descriptions.Item>
              <Descriptions.Item label="Email">{data.buyerInfo?.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{data.buyerInfo?.phone || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Ví nhận NFT"><Text copyable style={{ fontFamily: 'monospace' }}>{data.buyerInfo?.receivingWallet}</Text></Descriptions.Item>
            </Descriptions>

            {/* THÔNG TIN GIAO DỊCH */}
            <Descriptions title="💳 Thông tin Giao dịch (Transaction)" bordered size="small" column={2}>
              <Descriptions.Item label="Mã Đơn hàng (Order ID)">{data.transactionInfo?.orderId?.substring(0, 8)}...</Descriptions.Item>
              <Descriptions.Item label="Trạng thái Payment">
                <Tag color={data.transactionInfo?.paymentStatus === 'SUCCESS' ? 'green' : 'orange'}>
                  {data.transactionInfo?.paymentStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="TxHash (Blockchain)" span={2}>
                {data.transactionInfo?.paymentTxHash ? <Text copyable type="secondary">{data.transactionInfo?.paymentTxHash}</Text> : 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            {/* THÔNG TIN VÉ */}
            <Descriptions title="🎫 Thông tin Vé (Ticket & Zone)" bordered size="small" column={2}>
              <Descriptions.Item label="Khu vực">{data.zoneInfo?.zoneName}</Descriptions.Item>
              <Descriptions.Item label="Mức giá"><Text strong style={{ color: '#cf1322' }}>{data.zoneInfo?.price?.toLocaleString()} {data.zoneInfo?.currency}</Text></Descriptions.Item>
              <Descriptions.Item label="Vị trí ghế">{data.zoneInfo?.seatLabel || <Tag color="purple">Vé đứng tự do</Tag>}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái Vé">
                <Tag color="blue">{data.ticketInfo?.status}</Tag>
              </Descriptions.Item>

              {/* 🚀 SỬ DỤNG DAYJS TẠI ĐÂY */}
              <Descriptions.Item label="Ngày mua">
                {data.ticketInfo?.purchaseDate ? dayjs(data.ticketInfo.purchaseDate).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Check-in">
                {data.ticketInfo?.usedAt ? dayjs(data.ticketInfo.usedAt).format('DD/MM/YYYY HH:mm') : <Text type="secondary" italic>Chưa sử dụng</Text>}
              </Descriptions.Item>

              <Descriptions.Item label="Token ID (NFT)" span={2}>
                {data.ticketInfo?.tokenId ? <Text copyable strong>{data.ticketInfo?.tokenId}</Text> : <Text italic type="secondary">Đang chờ đúc (Minting...)</Text>}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default TicketInvoiceModal;