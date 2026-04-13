import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';

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
        <Card bordered={false} style={{ borderLeft: '4px solid #722ed1', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', background: '#f9f0ff' }}>
          <Statistic title="💰 Doanh thu ước tính" value={stats.revenue} suffix={stats.currency} loading={loading} valueStyle={{ color: '#722ed1' }} />
        </Card>
      </Col>
    </Row>
  );
};

export default TicketOverview;