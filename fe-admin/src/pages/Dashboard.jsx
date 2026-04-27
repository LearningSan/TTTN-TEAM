import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Space, Spin, Button, Avatar, Tag, DatePicker, Flex } from 'antd';
import {
  CustomerServiceOutlined,
  TagsOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  AlertOutlined,
  RightOutlined,
  DollarOutlined,
  CalendarOutlined,
  BarChartOutlined
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
  const [allOrders, setAllOrders] = useState([]);
  const [summary, setSummary] = useState({
    concerts: 0, users: 0, totalPaidOrders: 0, refunds: 0
  });

  const parseBE = (dateStr) => dayjs(dateStr, "DD/MM/YYYY HH:mm:ss");

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // [cite: 42, 61, 68, 71, 181]
        const [resStats, resConcerts, resUsers, resOrders, resRefunds] = await Promise.all([
          API.get('/admin/orders/revenue/total'), // [cite: 181]
          API.get('/admin/concerts?size=1'),      // [cite: 42]
          API.get('/admin/users?size=1'),         // [cite: 61]
          API.get('/admin/orders?size=1000'),     // Tăng size để tính toán doanh thu chính xác hơn 
          API.get('/admin/orders?status=CANCELLED&size=1') // [cite: 71]
        ]);

        const statsData = resStats.data || {};
        setSummary({
          concerts: resConcerts.data?.totalElements || 0,
          users: resUsers.data?.totalElements || 0,
          totalPaidOrders: statsData.totalPaidOrders || 0,
          refunds: resRefunds.data?.totalElements || 0
        });

        setAllOrders(resOrders.data?.content || []);
      } catch (error) {
        console.error("Lỗi Portal Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // 🚀 LOGIC TÍNH TOÁN DOANH THU ĐA TIỀN TỆ 
  const calculatedStats = useMemo(() => {
    const targetDate = filterDate.format('DD/MM/YYYY');

    const totalRevenueMap = {}; // Lưu tổng doanh thu tất cả các ngày
    const dailyRevenueMap = {}; // Lưu doanh thu riêng ngày được chọn
    let dailyCount = 0;
    const customerMap = {};

    allOrders.forEach(ord => {
      const d = parseBE(ord.createdAt);
      if (!d.isValid()) return;

      const dateKey = d.format('DD/MM/YYYY');
      const amount = ord.totalAmount || 0; // 
      const currency = ord.currency || 'USDT'; // 

      // 1. Cộng dồn vào Tổng doanh thu theo từng loại tiền
      if (!totalRevenueMap[currency]) totalRevenueMap[currency] = 0;
      totalRevenueMap[currency] += amount;

      // 2. Nếu trùng ngày chọn, cộng vào Doanh thu trong ngày
      if (dateKey === targetDate) {
        if (!dailyRevenueMap[currency]) dailyRevenueMap[currency] = 0;
        dailyRevenueMap[currency] += amount;
        dailyCount += 1;
      }

      const email = ord.userEmail;
      if (!customerMap[email]) {
        customerMap[email] = { name: ord.userName, email, totalSpent: 0, orderCount: 0 };
      }
      customerMap[email].totalSpent += amount;
      customerMap[email].orderCount += 1;
    });

    const topSpenders = Object.values(customerMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return { totalRevenueMap, dailyRevenueMap, dailyCount, topSpenders };
  }, [filterDate, allOrders]);

  return (
    <div style={{ padding: 0 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>TỔNG QUAN</Title>
        <Space direction="vertical" align="end">
          <Text type="secondary">Chọn ngày để xem báo cáo chi tiết:</Text>
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
          {/* 💰 CARD DOANH THU CHIA THEO TIỀN TỆ */}
          <Col xs={24} sm={24} lg={8}>
            <Card
              hoverable
              style={{ height: '100%', borderRadius: 12, borderLeft: `5px solid #fa8c16` }}
              onClick={() => navigate("/dashboard/orders")}
            >
              <div style={{ color: '#8c8c8c', fontWeight: 'bold', marginBottom: 8 }}>DOANH THU TỔNG</div>
              <Space direction="vertical" size={4} style={{ width: '100%', marginBottom: 12 }}>
                {Object.keys(calculatedStats.totalRevenueMap).length > 0 ? (
                  Object.entries(calculatedStats.totalRevenueMap).map(([curr, val]) => (
                    <div key={curr}>
                      <Text strong style={{ fontSize: 20, color: '#fa8c16' }}>{val.toLocaleString()} </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{curr}</Text>
                    </div>
                  ))
                ) : <Text strong style={{ fontSize: 20 }}>0 USDT</Text>}
              </Space>

              <div style={{ marginTop: 8, padding: '8px', background: '#fff7e6', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#d46b08', marginBottom: 4 }}>Ngày {filterDate.format('DD/MM')}:</div>
                {Object.keys(calculatedStats.dailyRevenueMap).length > 0 ? (
                  Object.entries(calculatedStats.dailyRevenueMap).map(([curr, val]) => (
                    <div key={curr}>
                      <Text strong style={{ color: '#fa8c16' }}>+ {val.toLocaleString()} {curr}</Text>
                    </div>
                  ))
                ) : <Text type="secondary" style={{ fontSize: 12 }}>Không có doanh thu</Text>}
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={{ height: '100%', borderRadius: 12, borderLeft: `5px solid #52c41a` }}
              onClick={() => navigate("/dashboard/tickets")}
            >
              <Statistic
                title={<Text strong style={{ color: '#8c8c8c' }}>VÉ ĐÃ BÁN</Text>}
                value={summary.totalPaidOrders}
                prefix={<TagsOutlined />}
                valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
              />
              <div style={{ marginTop: 8, padding: '8px', background: '#f6ffed', borderRadius: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Ngày {filterDate.format('DD/MM')}: </Text>
                <Text strong style={{ color: '#52c41a' }}>{calculatedStats.dailyCount} vé</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card hoverable style={{ height: '100%', borderRadius: 12, borderLeft: `5px solid #ff4d4f` }} onClick={() => navigate("/dashboard/orders")}>
              <Statistic title={<Text strong style={{ color: '#8c8c8c' }}>CẦN HOÀN TIỀN</Text>} value={summary.refunds} prefix={<AlertOutlined />} valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }} />
              <Button type="link" size="small" style={{ marginTop: 8, padding: 0 }}>Xử lý yêu cầu <RightOutlined /></Button>
            </Card>
          </Col>

          <Col xs={24} sm={8} lg={8}>
            <Card hoverable style={{ borderRadius: 12, borderLeft: `5px solid #1890ff` }} onClick={() => navigate("/dashboard/concerts")}>
              <Statistic title={<Text strong style={{ color: '#8c8c8c' }}>QUẢN LÝ CONCERT</Text>} value={summary.concerts} icon={<CustomerServiceOutlined />} valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={8} lg={8}>
            <Card hoverable style={{ borderRadius: 12, borderLeft: `5px solid #722ed1` }} onClick={() => navigate("/dashboard/users")}>
              <Statistic title={<Text strong style={{ color: '#8c8c8c' }}>QUẢN LÝ NGƯỜI DÙNG</Text>} value={summary.users} icon={<UserOutlined />} valueStyle={{ color: '#722ed1', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={8} lg={8}>
            <Card hoverable style={{ borderRadius: 12, borderLeft: `5px solid #13c2c2` }} onClick={() => navigate("/dashboard/orders")}>
              <Statistic title={<Text strong style={{ color: '#8c8c8c' }}>QUẢN LÝ ĐƠN HÀNG</Text>} value={summary.totalPaidOrders} icon={<ShoppingCartOutlined />} valueStyle={{ color: '#13c2c2', fontWeight: 'bold' }} />
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 40 }}>
          <Card title={<Space><BarChartOutlined /> <Text strong>Top Khách Hàng Chi Tiêu Nhiều Nhất</Text></Space>} size="small">
            <Table
              dataSource={calculatedStats.topSpenders}
              pagination={false}
              size="middle"
              rowKey="email"
              scroll={{ y: 400 }}
              columns={[
                {
                  title: 'Khách hàng',
                  render: (_, r) => (
                    <Space>
                      <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                      <div>
                        <Text strong>{r.name}</Text><br />
                        <Text type="secondary" style={{ fontSize: 11 }}>{r.email}</Text>
                      </div>
                    </Space>
                  )
                },
                { title: 'Số đơn', dataIndex: 'orderCount', align: 'center', width: 120 },
                {
                  title: 'Tổng chi tiêu',
                  align: 'right',
                  width: 250,
                  render: (_, r) => <Text type="danger" strong>{r.totalSpent.toLocaleString()} USDT</Text>
                }
              ]}
            />
          </Card>
        </div>
      </Spin>
    </div>
  );
};

export default Dashboard;