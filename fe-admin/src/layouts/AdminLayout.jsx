import { useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, CustomerServiceOutlined, TagsOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { clearToken, getUserId, getRefreshToken, getOrganizerName } from '../utils/auth';
import API from '../api/config';
import { Avatar, Space, Typography } from 'antd';
const { Text } = Typography;
const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy đường dẫn hiện tại để bôi đen menu
  const [collapsed, setCollapsed] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await API.post('/auth/admin/logout', { userId: getUserId(), refreshToken: getRefreshToken() });
    } catch (error) {
      console.error("Lỗi API logout:", error);
    } finally {
      clearToken();
      setLogoutLoading(false);
      navigate('/login');
    }
  };

  // Cấu hình các nút trong Menu
  const menuItems = [
    { key: '/dashboard', label: 'Bảng Điều Khiển' },
    { key: '/dashboard/concerts', label: 'Quản Lý Concert' },
    { key: '/dashboard/tickets', label: 'Quản Lý Vé' },
    { key: '/dashboard/users', label: 'Quản Lý Người Dùng' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Cột Menu bên trái */}
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6, textAlign: 'center', color: 'white', lineHeight: '32px', fontWeight: 'bold' }}>
          {collapsed ? 'TA' : 'TICKET ADMIN'}
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          defaultSelectedKeys={[location.pathname]} 
          items={menuItems} 
          onClick={({ key }) => navigate(key)} 
        />
      </Sider>

      {/* Nội dung bên phải */}
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Hệ thống Quản trị</h2>
            <Space size="middle">
      {/* Hiển thị lời chào và tên Admin */}
      <Space>
        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>Xin chào,</span>
          <Text strong>{getOrganizerName() || 'Admin'}</Text>
        </div>
      </Space>

      <Button 
        type="primary" 
        danger 
        icon={<LogoutOutlined />} 
        onClick={handleLogout} 
        loading={logoutLoading}
      >
        Đăng xuất
      </Button>
    </Space>
        </Header>
        
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            {/* CÁC TRANG CON SẼ ĐƯỢC ĐỔ VÀO ĐÂY */}
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;