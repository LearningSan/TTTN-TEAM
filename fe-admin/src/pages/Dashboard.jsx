import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Spin, Button, DatePicker, Flex } from 'antd';
import {
  CustomerServiceOutlined,
  TagsOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  AlertOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import API from '../api/config';

dayjs.extend(customParseFormat);
const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(dayjs());

  // 🚀 State gọn nhẹ chỉ chứa các con số tổng quát từ API
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    dailyRevenue: 0,
    totalTicketsSold: 0,
    dailyTicketsSold: 0,
    pendingRefunds: 0,
    totalConcerts: 0,
    totalUsers: 0,
    totalOrders: 0,
    currency: 'ETH'
  });

  // 🚀 API duy nhất: Lấy toàn bộ thông số dashboard
  const fetchData = useCallback(async (dateObj) => {
    setLoading(true);
    try {
      const formattedDate = dateObj.format('YYYY-MM-DD');
      // Chỉ gọi đúng endpoint stats, không gọi orders?size=... nữa
      const [resStats, resNeedRefund] = await Promise.all([
        API.get('/admin/orders/revenue/total', { params: { date: formattedDate } }),
        API.get('/admin/orders', { params: { status: 'NEED_REFUND', size: 1 } }) // 🚀 Lấy 1 cái thôi để lấy totalElements
      ]);

      if (resStats.data) {
        setSummary({
          ...resStats.data,
          pendingRefunds: resNeedRefund.data?.totalElements || 0,
          currency: 'ETH'
        });
      }
    } catch (error) {
      console.error("Lỗi Portal Dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(filterDate);
  }, [filterDate, fetchData]);

  return (
    <div style={{ padding: 0 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{
          margin: 0, fontSize: '1.5em',
          fontWeight: 'bold',
          lineHeight: 1.2
        }}>TỔNG QUAN HỆ THỐNG</Title>
        <Space direction="vertical" align="end">
          <Text type="secondary">Xem báo cáo theo ngày:</Text>
          <DatePicker
            value={filterDate}
            onChange={(date) => setFilterDate(date || dayjs())}
            format="DD/MM/YYYY"
            allowClear={false}
          />
        </Space>
      </Flex>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* 💰 CARD DOANH THU TỔNG - Lấy từ API DashboardStatsResponse */}
          <Col xs={24} sm={24} lg={8}>
            <Card
              hoverable
              style={{ height: '100%', borderRadius: 12, borderLeft: `5px solid #fa8c16` }}
              onClick={() => navigate("/dashboard/tickets")}
            >
              <div style={{ color: '#8c8c8c', fontWeight: 'bold', marginBottom: 8 }}>DOANH THU TỔNG</div>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ fontSize: 26, color: '#fa8c16' }}>
                  {summary.totalRevenue?.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </Text>
                <Text type="secondary" style={{ fontSize: 14, marginLeft: 4 }}>{summary.currency}</Text>
              </div>

              <div style={{ marginTop: 8, padding: '12px', background: '#fff7e6', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#d46b08', marginBottom: 4 }}>Doanh thu ngày {filterDate.format('DD/MM')}:</div>
                <Text strong style={{ fontSize: 18, color: '#fa8c16' }}>
                  + {summary.dailyRevenue?.toLocaleString(undefined, { maximumFractionDigits: 6 })} {summary.currency}
                </Text>
              </div>
            </Card>
          </Col>

          {/* 🎫 CARD VÉ ĐÃ BÁN */}
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={{ height: '100%', borderRadius: 12, borderLeft: `5px solid #52c41a` }}
              onClick={() => navigate("/dashboard/tickets")}
            >
              <Statistic
                title={<Text strong style={{ color: '#8c8c8c' }}>TỔNG VÉ ĐÃ BÁN</Text>}
                value={summary.totalTicketsSold}
                prefix={<TagsOutlined />}
                valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
              />
              <div style={{ marginTop: 12, padding: '8px', background: '#f6ffed', borderRadius: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Ngày {filterDate.format('DD/MM')}: </Text>
                <Text strong style={{ color: '#52c41a' }}>{summary.dailyTicketsSold} vé</Text>
              </div>
            </Card>
          </Col>

          {/* 🔴 CARD CẦN HOÀN TIỀN (NỢ) */}
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={{ height: '100%', borderRadius: 12, borderLeft: `5px solid #ff4d4f` }}
              onClick={() => navigate("/dashboard/orders?status=NEED_REFUND")}
            >
              <Statistic
                title={<Text strong style={{ color: '#8c8c8c' }}>CẦN HOÀN TIỀN (NỢ)</Text>}
                value={summary.pendingRefunds}
                prefix={<AlertOutlined />}
                valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
              />
              <Button
                type="link"
                danger
                size="small"
                style={{ marginTop: 8, padding: 0 }}
                // Đảm bảo nút bấm cũng thực hiện điều hướng tương tự card
                onClick={(e) => {
                  e.stopPropagation(); // Tránh trigger onClick của Card
                  navigate("/dashboard/orders?status=NEED_REFUND");
                }}
              >
                Xử lý danh sách nợ <RightOutlined />
              </Button>
            </Card>
          </Col>

          {/* CÁC CARD QUẢN LÝ NHANH */}
          <Col xs={24} sm={8} lg={8}>
            <Card hoverable style={{ borderRadius: 12, borderLeft: `5px solid #1890ff` }} onClick={() => navigate("/dashboard/concerts")}>
              <Statistic title={<Text strong style={{ color: '#8c8c8c' }}>TỔNG CONCERT</Text>} value={summary.totalConcerts} icon={<CustomerServiceOutlined />} valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={8} lg={8}>
            <Card hoverable style={{ borderRadius: 12, borderLeft: `5px solid #722ed1` }} onClick={() => navigate("/dashboard/users")}>
              <Statistic title={<Text strong style={{ color: '#8c8c8c' }}>TỔNG NGƯỜI DÙNG</Text>} value={summary.totalUsers} icon={<UserOutlined />} valueStyle={{ color: '#722ed1', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={8} lg={8}>
            <Card hoverable style={{ borderRadius: 12, borderLeft: `5px solid #13c2c2` }} onClick={() => navigate("/dashboard/orders")}>
              <Statistic title={<Text strong style={{ color: '#8c8c8c' }}>TỔNG ĐƠN HÀNG</Text>} value={summary.totalOrders} icon={<ShoppingCartOutlined />} valueStyle={{ color: '#13c2c2', fontWeight: 'bold' }} />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;