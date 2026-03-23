import { Button, message, Card, Statistic, Row, Col, Layout } from 'antd';
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
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: 0 }}>Bảng điều khiển Admin</h1>
        <Button type="primary" danger onClick={handleLogout} size="large">
          Đăng xuất
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#e6f7ff', borderRadius: '8px' }}>
            <Statistic title="Tổng vé NFT phát hành" value={1250} precision={0} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#f6ffed', borderRadius: '8px' }}>
            <Statistic title="Người dùng hệ thống" value={482} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#fff7e6', borderRadius: '8px' }}>
            <Statistic title="Doanh thu hôm nay (ETH)" value={1.52} precision={2} />
          </Card>
        </Col>
      </Row>

      <Card title="Hoạt động gần đây" style={{ marginTop: '24px' }}>
        <p>Hệ thống đang hoạt động ổn định trên nền tảng Blockchain.</p>
        <p>Phiên đăng nhập của bạn được bảo mật bởi Access Token.</p>
      </Card>
    </div>
  );
};

export default Dashboard;