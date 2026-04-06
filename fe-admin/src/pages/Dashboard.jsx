import { Flex, Card, Row, Col, Statistic } from 'antd';
import { CustomerServiceOutlined, TagsOutlined, DollarOutlined } from '@ant-design/icons';

const Dashboard = () => {
  return (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Bảng điều khiển Admin</h1>
      </Flex>

      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false}>
            {/* <Statistic title="Tổng số Concert"  prefix={<CustomerServiceOutlined />} /> */}
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            {/* <Statistic title="Vé đã bán"  prefix={<TagsOutlined />} /> */}
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            {/* <Statistic title="Doanh thu dự kiến"  prefix={<DollarOutlined />} suffix="VNĐ" /> */}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;