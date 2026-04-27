import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Spin, message, Typography, Image, Button, Space, Tooltip } from 'antd';
import { CopyOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'; // 🚀 Đã được sử dụng ở bên dưới
import API from '../api/config';
import OrderDetailModal from './OrderDetailModal';
const { Text, Title } = Typography;

const TicketInvoiceModal = ({ ticketId, open, onCancel }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderModal, setOrderModal] = useState({ open: false, orderId: null });
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
  }, [open, ticketId, onCancel]);

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
            <Descriptions title="👤 Thông tin Khách hàng" bordered size="small" column={2}>
              <Descriptions.Item label="Tên khách hàng"><Text strong>{data.buyerInfo?.name}</Text></Descriptions.Item>
              <Descriptions.Item label="Email">{data.buyerInfo?.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{data.buyerInfo?.phone || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Ví nhận NFT"><Text copyable style={{ fontFamily: 'monospace' }}>{data.buyerInfo?.receivingWallet}</Text></Descriptions.Item>
            </Descriptions>

            {/* THÔNG TIN GIAO DỊCH */}
            <Descriptions title="💳 Thông tin Giao dịch" bordered size="small" column={2}>
              <Descriptions.Item label="Mã Đơn hàng">
                {data.transactionInfo?.orderId ? (
                  <Space>
                    <Tooltip title={data.transactionInfo.orderId} placement="top">
                      <Text
                        copyable={{ text: data.transactionInfo.orderId }}
                        strong
                        style={{ fontFamily: 'monospace' }}
                      >
                        {data.transactionInfo.orderId.substring(0, 8)}...
                      </Text>
                    </Tooltip>
                    {/* BÊN PHẢI: Icon Xem chi tiết */}
                    <Tooltip title="Xem chi tiết đơn hàng này">
                      <Button
                        size="small"
                        type="primary"
                        ghost
                        icon={<EyeOutlined />}
                        onClick={() => setOrderModal({ open: true, orderId: data.transactionInfo.orderId })}
                      />
                    </Tooltip>
                  </Space>
                ) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái Payment">
                <Tag color={data.transactionInfo?.paymentStatus === 'SUCCESS' ? 'green' : 'orange'}>
                  {data.transactionInfo?.paymentStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="PaymentTxHash" span={2}>
                {data.transactionInfo?.paymentTxHash ? <Text copyable type="secondary">{data.transactionInfo?.paymentTxHash}</Text> : 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            {/* THÔNG TIN VÉ */}
            <Descriptions title="🎫 Thông tin Vé (Ticket & Zone)" bordered size="small" column={2}>
              {/* 🚀 Bổ sung Mã Vé ID */}
              <Descriptions.Item label="Mã Vé (Ticket ID)" span={2}>
                <Text copyable strong>{data.ticketInfo?.ticketId}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Khu vực">{data.zoneInfo?.zoneName}</Descriptions.Item>
              <Descriptions.Item label="Mức giá"><Text strong style={{ color: '#cf1322' }}>{data.zoneInfo?.price?.toLocaleString(undefined, { maximumFractionDigits: 6 })} {data.zoneInfo?.currency}</Text></Descriptions.Item>
              <Descriptions.Item label="Vị trí ghế">{data.zoneInfo?.seatLabel || <Tag color="purple">Vé đứng tự do</Tag>}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái Vé">
                <Tag color="blue">{data.ticketInfo?.status}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày mua">
                {data.ticketInfo?.purchaseDate ? dayjs(data.ticketInfo.purchaseDate).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Check-in">
                {data.ticketInfo?.usedAt ? dayjs(data.ticketInfo.usedAt).format('DD/MM/YYYY HH:mm') : <Text type="secondary" italic>Chưa sử dụng</Text>}
              </Descriptions.Item>

              <Descriptions.Item label="Token ID (NFT)" span={2}>
                {data.ticketInfo?.tokenId ? <Text copyable strong>{data.ticketInfo?.tokenId}</Text> : <Text italic type="secondary">Đang chờ đúc (Minting...)</Text>}
              </Descriptions.Item>

              {/* 🚀 Bổ sung Mint TxHash */}
              <Descriptions.Item label="MintTxHash" span={2}>
                {data.ticketInfo?.mintTxHash ? (
                  <a href={`https://sepolia.etherscan.io/tx/${data.ticketInfo.mintTxHash}`} target="_blank" rel="noreferrer">
                    {data.ticketInfo.mintTxHash}
                  </a>
                ) : <Text italic type="secondary">Chưa có (Chưa đúc NFT)</Text>}
              </Descriptions.Item>

              {/* 🚀 Bổ sung QR Code URL */}
              <Descriptions.Item label="Mã QR Check-in" span={2}>
                {data.ticketInfo?.qrUrl ? (
                  <Image
                    width={150} // Kích thước QR Code
                    src={data.ticketInfo.qrUrl} // Dán thẳng cái chuỗi data:image/png;base64... vào đây
                    alt="QR Code Check-in"
                    style={{ borderRadius: 8, border: '1px solid #f0f0f0', padding: 4 }}
                  />
                ) : <Text italic type="secondary">Chưa tạo QR</Text>}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Spin>
      <OrderDetailModal
        open={orderModal.open}
        orderId={orderModal.orderId}
        onCancel={() => setOrderModal({ open: false, orderId: null })}
      />
    </Modal>
  );
};

export default TicketInvoiceModal;