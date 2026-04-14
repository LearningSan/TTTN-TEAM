import React from 'react';
import { Card, Table, Tag, Space, Typography, Badge, Tooltip, Button, message } from 'antd';
import { IdcardOutlined, CopyOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const TicketListTable = ({ tickets, loading, pagination, onChangePage, concertId, onViewInvoice }) => {
  const columns = [
    { 
      title: 'Mã vé (Ticket ID)', 
      dataIndex: 'ticketId',
      render: (id) => (
        <Tooltip title="Copy ID">
          <Tag icon={<CopyOutlined />} style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(id); message.success("Đã copy mã vé!"); }}>
            {id?.substring(0, 8)}...
          </Tag>
        </Tooltip>
      )
    },
    { 
      title: 'Khách hàng', 
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.buyerName || 'Khách ẩn danh'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>
        </Space>
      )
    },
    
    { title: 'Khu vực & Vị trí', render: (_, r) => <Space><Tag color="geekblue">{r.zoneName}</Tag>{r.seatLabel && <Tag>{r.seatLabel}</Tag>}</Space> },
    { title: 'Ngày mua', dataIndex: 'purchaseDate', render: (d) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '-' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status',
      render: (s) => {
        const statusMap = {
          'ACTIVE': { color: 'success', text: 'Hoạt động' },
          'USED': { color: 'default', text: 'Đã check-in' },
          'CANCELLED': { color: 'error', text: 'Đã hủy' },
          'MINTING': { color: 'processing', text: 'Đang tạo NFT...' },
          'TRANSFERRED': { color: 'warning', text: 'Đã chuyển nhượng' }
        };
        const st = statusMap[s] || { color: 'default', text: s };
        return <Badge status={st.color} text={st.text} />;
      }
    },
    {
      title: 'Thao tác',
      align: 'center',
      render: (_, r) => (
        <Tooltip title="Xem chi tiết Hóa đơn & User">
          {/* 🚀 Bấm nút này sẽ mở Modal chi tiết */}
          <Button 
            type="primary" 
            ghost size="small" 
            icon={<EyeOutlined />} 
            onClick={() => onViewInvoice(r.ticketId)} 
          />
        </Tooltip>
      )
    }
  ];

  return (
    <Card title={<><IdcardOutlined /> Lịch sử giao dịch & Danh sách vé</>} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <Table 
        columns={columns} 
        dataSource={tickets} 
        rowKey="ticketId" 
        loading={loading}
        pagination={pagination}
        onChange={(p) => onChangePage(concertId, p.current - 1, p.pageSize)}
        locale={{ emptyText: "Sự kiện này hiện chưa có người mua vé" }}
      />
    </Card>
  );
};

export default TicketListTable;