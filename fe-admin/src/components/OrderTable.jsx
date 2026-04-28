import React from 'react';
import { Table, Tag, Button, Typography, Space, Popconfirm, message, Tooltip } from 'antd';
import { EyeOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import API from '../api/config';
const { Text } = Typography;
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
const OrderTable = ({ orders, loading, pagination, onChangePage, onViewDetail,filterStatus }) => {
  const handleRefund = async (orderId) => {
    try {
      message.loading({ content: 'Đang xử lý hoàn tiền qua Smart Contract...', key: 'refund' });
      // 🚀 Gọi API mới của BE 
      await API.post(`/admin/orders/${orderId}/refund`);
      message.success({ content: 'Hoàn tiền thành công!', key: 'refund' });

      // 🚀 Gọi hàm fetchOrders() truyền từ OrderManagement xuống để load lại bảng
      onChangePage(pagination.current, pagination.pageSize);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Lỗi khi hoàn tiền!';
      message.error({ content: errorMsg, key: 'refund' });
    }
  };
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
      render: (val, r) => <Text strong color="red">{val?.toLocaleString(undefined, { maximumFractionDigits: 4 })} {r.currency}</Text>
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
      key: 'status_column',
      render: (_, r) => {
        // 🚀 LOGIC "ÉP" TRẠNG THÁI: 
        // Nếu đang lọc NEED_REFUND mà DB trả về PAID, thì hiện là NEED_REFUND cho Admin dễ hiểu
        const displayStatus = (filterStatus === 'NEED_REFUND' && r.orderStatus === 'PAID') 
          ? 'NEED_REFUND' 
          : r.orderStatus;

        const colors = { 
          'PAID': 'success', 
          'PENDING': 'processing', 
          'CANCELLED': 'error', 
          'EXPIRED': 'warning',
          'NEED_REFUND': 'volcano', 
          'REFUNDED': 'purple'
        };

        return <Tag color={colors[displayStatus] || 'default'}>{displayStatus}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      align: 'center',
      render: (_, r) => {
        // 🚀 ĐIỀU KIỆN HIỆN NÚT: Hiện khi DB trả về NEED_REFUND 
        // HOẶC khi Admin đang chủ động lọc danh sách nợ
        const isNeedRefund = r.orderStatus === 'NEED_REFUND' || filterStatus === 'NEED_REFUND';

        return (
          <Space>
            <Button
              type="primary" ghost size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewDetail(r.orderId)}
            />
            
            {isNeedRefund && (
              <Popconfirm 
                title="Xác nhận hoàn tiền?" 
                onConfirm={() => handleRefund(r.orderId)}
              >
                <Button size="small" type="primary" danger icon={<DollarOutlined />}>
                  Hoàn tiền
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      }
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