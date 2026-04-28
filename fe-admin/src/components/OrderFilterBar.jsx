import React, { useEffect, useRef } from 'react';
import { Select, Card, Space, Typography,Input} from 'antd';

const { Text } = Typography;

const OrderFilterBar = ({ keyword, setKeyword, filterStatus, setFilterStatus, onFilterTrigger }) => {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const delay = setTimeout(() => { onFilterTrigger(); }, 500);
    return () => clearTimeout(delay);
  }, [keyword, onFilterTrigger]);

  return (
    <div style={{ marginBottom: 16, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Input
        placeholder="Tìm theo Mã đơn, Email, Tên khách..."
        allowClear
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ width: 350 }} 
      />
      <Select
        placeholder="Lọc theo Trạng thái"
        allowClear
        style={{ width: 240 }} 
        value={filterStatus}
        onChange={(val) => { setFilterStatus(val); onFilterTrigger(val); }}
        options={[
          { value: 'PENDING', label: '⏳ Chờ thanh toán' },
          { value: 'PAID', label: '✅ Đã thanh toán' },
          { value: 'CANCELLED', label: '❌ Đã hủy' },
          { value: 'EXPIRED', label: '🕒 Hết hạn' },
          { value: 'NEED_REFUND', label: '💸 Chờ hoàn tiền (Nợ)' },
          { value: 'REFUNDED', label: '💰 Đã hoàn tiền' },
        ]}
      />
    </div>
  );
};

export default OrderFilterBar;