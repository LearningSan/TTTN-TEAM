import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, message, Button } from 'antd';
import { ReloadOutlined, UserOutlined } from '@ant-design/icons';
import API from '../api/config';
import UserFilterBar from '../components/UserFilterBar';
import UserTable from '../components/UserTable';

const { Title } = Typography;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [keyword, setKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);

  const fetchUsers = useCallback(async (page = 1, size = 10, kw = keyword, st = filterStatus) => {
    setLoading(true);
    try {
      let url = `/admin/users?page=${page - 1}&size=${size}`;
      if (kw) url += `&keyword=${encodeURIComponent(kw)}`;
      if (st) url += `&status=${st}`;

      const res = await API.get(url);
      const data = res.data;
      setUsers(data?.content || []);
      setPagination(prev => ({ ...prev, current: page, total: data?.totalElements || 0 }));
    } catch {
      message.error('Không thể tải danh sách người dùng!');
    } finally {
      setLoading(false);
    }
  }, [keyword, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  const handleFilter = useCallback((st) => {
  fetchUsers(1, pagination.pageSize, keyword, st || filterStatus);
}, [fetchUsers, pagination.pageSize, keyword, filterStatus]);

useEffect(() => {
  fetchUsers();
}, [fetchUsers]);
  const handleToggleStatus = async (userId, newStatus) => {
    try {
      // Gọi API cập nhật trạng thái 
      await API.put(`/admin/users/${userId}/status?newStatus=${newStatus}`);
      message.success(`Đã ${newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản thành công!`);
      fetchUsers(pagination.current, pagination.pageSize); // Refresh data
    } catch {
      message.error('Cập nhật trạng thái thất bại!');
    }
  };

  const handleReset = () => {
    setKeyword('');
    setFilterStatus(null);
    fetchUsers(1, 10, '', null);
  };
  
  return (
    <div style={{ padding: 1, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card
        title={<><UserOutlined /> Quản lý Người dùng</>}
        extra={<Button icon={<ReloadOutlined />} onClick={handleReset}>Làm mới</Button>}
        bordered={false}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <UserFilterBar
          keyword={keyword} setKeyword={setKeyword}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          onFilterTrigger={handleFilter}
        />

        <UserTable
          users={users}
          loading={loading}
          pagination={pagination}
          onChangePage={(p, s) => fetchUsers(p, s)}
          onToggleStatus={handleToggleStatus}
        />
      </Card>
    </div>
  );
};

export default UserManagement;