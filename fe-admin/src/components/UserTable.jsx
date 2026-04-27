import React from 'react';
import { Table, Tag, Button, Popconfirm, Typography } from 'antd';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'; // 🚀 Import thêm plugin này

// Kích hoạt plugin để dayjs hiểu định dạng chuỗi của Backend
dayjs.extend(customParseFormat);

const { Text } = Typography;

const UserTable = ({ users, loading, pagination, onChangePage, onToggleStatus }) => {
  const columns = [
    { title: 'Tên người dùng', dataIndex: 'name', render: (n) => <Text strong>{n}</Text> },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      render: (r) => <Tag color={r === 'ADMIN' ? 'red' : r === 'ORGANIZER' ? 'purple' : 'blue'}>{r}</Tag>
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'createdAt',
      render: (d) => {
        if (!d) return '-';
        // 🚀 Báo cho dayjs biết dữ liệu đang là ngày/tháng/năm
        const parsedDate = dayjs(d, "DD/MM/YYYY HH:mm:ss");
        return parsedDate.isValid() ? parsedDate.format('DD/MM/YYYY HH:mm') : d;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s) => {
        // 🚀 Đổi LOCKED thành BANNED
        const color = s === 'ACTIVE' ? 'success' : s === 'LOCKED' ? 'error' : 'warning';
        return <Tag color={color}>{s}</Tag>;
      }
    },
    {
      title: 'Hành động',
      align: 'center',
      render: (_, r) => {
        if (r.role === 'ADMIN') return <Text type="secondary" italic>Không thể khóa</Text>;

        const isLocked = r.status === 'LOCKED';
        return (
          <Popconfirm
            title={isLocked ? "Mở khóa tài khoản này?" : "Khóa tài khoản này?"}
            description={isLocked ? "Xác nhận mở khóa tài khoản này" : "Xác nhận khóa tài khoản này"}
            onConfirm={() => onToggleStatus(r.userId, isLocked ? 'ACTIVE' : 'LOCKED')} // 🚀 Gửi LOCKED lên Backend
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ danger: !isLocked }}
          >
            <Button
              size="small"
              type={isLocked ? 'primary' : 'default'}
              danger={!isLocked}
              icon={isLocked ? <UnlockOutlined /> : <LockOutlined />}
            >
              {isLocked ? 'Mở khóa' : 'Khóa'}
            </Button>
          </Popconfirm>
        );
      }
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="userId"
      loading={loading}
      pagination={pagination}
      onChange={(p) => onChangePage(p.current, p.pageSize)}
      bordered
    />
  );
};

export default UserTable;