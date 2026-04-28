import React from 'react';
import { Select, Card, Space, Typography } from 'antd';

const { Text } = Typography;

const OrderFilterBar = ({ filterStatus, setFilterStatus, onFilterTrigger }) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <Space>
        <Text strong>Trạng thái đơn hàng:</Text>
        <Select
          placeholder="Tất cả trạng thái"
          allowClear
          style={{ width: 220 }}
          value={filterStatus}
          onChange={(val) => {
            setFilterStatus(val);
            onFilterTrigger(val);
          }}
          options={[
            { value: 'PENDING', label: '⏳ Chờ thanh toán (PENDING)' },
            { value: 'PAID', label: '✅ Đã thanh toán (PAID)' },
            { value: 'CANCELLED', label: '❌ Đã hủy (CANCELLED)' },
            { value: 'EXPIRED', label: '🕒 Hết hạn (EXPIRED)' },
            { value: 'NEED_REFUND', label: '💸 Chờ hoàn tiền (NEED_REFUND)' },
            { value: 'REFUNDED', label: '💰 Đã hoàn tiền (REFUNDED)' },
          ]}
        />
      </Space>
    </div>
  );
};

export default OrderFilterBar;