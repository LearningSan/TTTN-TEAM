import React from 'react';
import { Table, Tag, Button, Typography, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Tooltip } from 'antd';
const { Text } = Typography;
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
const OrderTable = ({ orders, loading, pagination, onChangePage, onViewDetail }) => {
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      render: (id) => (
        <Tooltip title={id} placement="topLeft">
          <Text copyable={{ text: id }}>{id?.substring(0, 8)}...</Text>
        </Tooltip>
      )
    },
    {
      title: 'Khách hàng',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.userName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.userEmail}</Text>
        </Space>
      )
    },
    { title: 'Concert', dataIndex: 'concertTitle', ellipsis: true },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      render: (val, r) => <Text strong color="red">{val?.toLocaleString()} {r.currency}</Text>
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      render: (d) => {
        if (!d) return '-';
        // 🚀 Bước 3: Ép kiểu dữ liệu kèm theo Format tương ứng từ API
        const parsedDate = dayjs(d, "DD/MM/YYYY HH:mm:ss"); 
        
        // Trả về định dạng hiển thị đẹp cho Admin (bỏ bớt giây cho gọn)
        return parsedDate.isValid() ? parsedDate.format('DD/MM/YYYY HH:mm') : d;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      render: (status) => {
        const colors = { 'PAID': 'success', 'PENDING': 'processing', 'CANCELLED': 'error', 'EXPIRED': 'warning' };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: 'Chi tiết',
      align: 'center',
      render: (_, r) => (
        <Button 
          type="primary" 
          ghost 
          size="small" 
          icon={<EyeOutlined />} 
          onClick={() => onViewDetail(r.orderId)} 
        />
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="orderId"
      loading={loading}
      pagination={pagination}
      onChange={(p) => onChangePage(p.current, p.pageSize)}
      bordered
    />
  );
};

export default OrderTable;