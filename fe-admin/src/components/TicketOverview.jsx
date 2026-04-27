import React from 'react';
import { Row, Col, Card, Statistic, Typography, Space } from 'antd';
const { Text } = Typography;
const TicketOverview = ({ stats, loading }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card bordered={false} style={{ borderLeft: '4px solid #1890ff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Statistic title="🎫 Tổng số vé phát hành" value={stats.total} loading={loading} />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false} style={{ borderLeft: '4px solid #52c41a', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Statistic title="🔥 Số vé đã bán" value={stats.sold} loading={loading} valueStyle={{ color: '#52c41a' }} />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false} style={{ borderLeft: '4px solid #faad14', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Statistic title="🎟️ Số vé còn lại" value={stats.available} loading={loading} valueStyle={{ color: stats.available === 0 ? '#ff4d4f' : '#faad14' }} />
        </Card>
      </Col>
      <Col span={6}>
        <Card
          bordered={false}
          style={{
            borderLeft: '4px solid #722ed1',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            background: '#f9f0ff',
            minHeight: '120px' // Đảm bảo chiều cao khi hiện nhiều dòng tiền
          }}
        >
          <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px', marginBottom: '8px' }}>
            💰 Doanh thu
          </div>

          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            {loading ? (
              <Statistic value=" " loading={true} />
            ) : (
              // Kiểm tra nếu có dữ liệu trong revenueMap
              stats.revenueMap && Object.keys(stats.revenueMap).length > 0 ? (
                Object.entries(stats.revenueMap).map(([currency, amount]) => (
                  <div key={currency} style={{ marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 20, color: '#722ed1' }}>
                      {amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      <span style={{ fontSize: 13, marginLeft: 4, fontWeight: 'normal' }}>{currency}</span>
                    </Text>
                  </div>
                ))
              ) : (
                // Trường hợp chưa có doanh thu
                <Text strong style={{ fontSize: 20, color: '#722ed1' }}>0 USDT</Text>
              )
            )}
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default TicketOverview;