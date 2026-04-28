import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, message } from 'antd';
import { ReloadOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import API from '../api/config';
import OrderFilterBar from '../components/OrderFilterBar';
import OrderTable from '../components/OrderTable';
import OrderDetailModal from '../components/OrderDetailModal';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [detailModal, setDetailModal] = useState({ open: false, orderId: null });

  const fetchOrders = useCallback(async (page = 1, size = 10, status = filterStatus) => {
    setLoading(true);
    try {
      let url = `/admin/orders?page=${page - 1}&size=${size}`;
      if (status) url += `&status=${status}`;

      const res = await API.get(url);
      setOrders(res.data?.content || []);
      setPagination(prev => ({ ...prev, current: page, total: res.data?.totalElements || 0 }));
    } catch {
      message.error("Lỗi khi tải danh sách đơn hàng!");
    } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleReset = () => {
    setFilterStatus(null);
    fetchOrders(1, 10, null);
  };

  return (
    <div style={{ padding: 0, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card
        title={<h2>Quản lý Đơn hàng</h2>}
        extra={<Button icon={<ReloadOutlined />} onClick={handleReset}>Làm mới</Button>}
        bordered={false}
      >
        <OrderFilterBar
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          onFilterTrigger={(st) => fetchOrders(1, pagination.pageSize, st)}
        />

        <OrderTable
          orders={orders}
          loading={loading}
          pagination={pagination}
          filterStatus={filterStatus}
          onChangePage={(p, s) => fetchOrders(p, s)}
          onViewDetail={(id) => setDetailModal({ open: true, orderId: id })}
        />
      </Card>

      <OrderDetailModal
        open={detailModal.open}
        orderId={detailModal.orderId}
        onCancel={() => setDetailModal({ open: false, orderId: null })}
      />
    </div>
  );
};

export default OrderManagement;