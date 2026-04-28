import React from 'react';
import { Row, Col, Card, Statistic, Typography, Space } from 'antd';
const { Text } = Typography;
const TicketOverview = ({ stats, loading }) => {
  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    borderRadius: '8px',
    textAlign: 'center'
  };

  const bodyStyle = {
    padding: '16px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  };
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="stretch">
      {/* 🎫 Tổng số vé */}
      <Col span={6}>
        <Card
          bordered={false}
          style={{ ...cardStyle, borderLeft: '5px solid #1890ff' }}
          styles={{ body: bodyStyle }} 
        >
          <Statistic
            title={<Text strong style={{ color: 'rgba(0, 0, 0, 0.45)' }}>Tổng số vé phát hành</Text>}
            value={stats.total}
            loading={loading}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card
          bordered={false}
          style={{ ...cardStyle, borderLeft: '5px solid #52c41a' }}
          styles={{ body: bodyStyle }}
        >
          <Statistic
            title={<Text strong style={{ color: 'rgba(0, 0, 0, 0.45)' }}>Số vé đã bán</Text>}
            value={stats.sold}
            loading={loading}
            valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
          />
        </Card>
      </Col>

      <Col span={6}>
        <Card
          bordered={false}
          style={{ ...cardStyle, borderLeft: '5px solid #faad14' }}
          styles={{ body: bodyStyle }}
        >
          <Statistic
            title={<Text strong style={{ color: 'rgba(0, 0, 0, 0.45)' }}>Số vé còn lại</Text>}
            value={stats.available}
            loading={loading}
            valueStyle={{ color: stats.available === 0 ? '#ff4d4f' : '#faad14', fontWeight: 'bold' }}
          />
        </Card>
      </Col>

      {/* 💰 Doanh thu (Card đặc biệt hiện nhiều loại tiền) */}
      <Col span={6}>
        <Card
          bordered={false}
          style={{
            ...cardStyle,
            borderLeft: '5px solid #722ed1',
            background: '#f9f0ff'
          }}
          styles={{ body: bodyStyle }}
        >
          <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>
            Doanh thu
          </div>

          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            {loading ? (
              <Statistic value=" " loading={true} />
            ) : (
              stats.revenueMap && Object.keys(stats.revenueMap).length > 0 ? (
                Object.entries(stats.revenueMap).map(([currency, amount]) => (
                  <div key={currency}>
                    <Text strong style={{ fontSize: 22, color: '#722ed1' }}>
                      {amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      <span style={{ fontSize: 13, marginLeft: 4, fontWeight: 'normal' }}>{currency}</span>
                    </Text>
                  </div>
                ))
              ) : (
                <Text strong style={{ fontSize: 22, color: '#722ed1' }}>0 USDT</Text>
              )
            )}
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default TicketOverview;