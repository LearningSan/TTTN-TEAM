import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import API from '../api/config';
import { saveToken } from '../utils/auth';
import { jwtDecode } from "jwt-decode";
const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      // Gửi email/password lên API Admin
      const res = await API.post('/auth/admin/login', values);
      
      const { accessToken, refreshToken } = res.data;
      
      if (accessToken) {
        const decoded = jwtDecode(accessToken);
        console.log("Check Role:", decoded.role);
        // Bóc tách 'sub' làm userId và 'role' để lưu trữ
        saveToken(accessToken, refreshToken, decoded.sub);
        
        message.success('Chào Admin! Đăng nhập thành công.');
        navigate('/dashboard');
      }
    } catch  {
      message.error('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="HỆ THỐNG QUẢN TRỊ TICKET-X" style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item 
            label="Email quản trị" 
            name="email" 
            rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item 
            label="Mật khẩu" 
            name="password" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 10 }}>
            Đăng nhập hệ thống
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;