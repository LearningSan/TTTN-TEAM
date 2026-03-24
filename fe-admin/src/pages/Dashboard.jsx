import { Button, Flex, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import API from '../api/config';
import { clearToken, getRefreshToken, getUserId } from '../utils/auth';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const body = {
        userId: getUserId(),
        refreshToken: getRefreshToken()
      };
      // Gọi API Logout để hủy token trên Server
      await API.post('/auth/admin/logout', body);
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error);
    } finally {
      // Dù API thành công hay lỗi, vẫn phải xóa token ở máy khách để bảo mật
      clearToken();
      message.success('Đã đăng xuất thành công!');
      navigate('/login');
    }
  };

  return (
    <Flex justify="space-between" align="center" style={{ padding: '24px', marginBottom: '32px' }}>
      <h1 style={{ margin: 0 }}>Bảng điều khiển Admin</h1>
      <Button type="primary" danger onClick={handleLogout} size="large">
        Đăng xuất
      </Button>
    </Flex>
  );
};

export default Dashboard;