import React from 'react';
import { Card, Table, Tag, Space, Typography, Progress, Badge } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const TicketZoneStats = ({ zones, loading }) => {

  // 1. CỘT CHO BẢNG CON (Hiển thị chi tiết từng Tier)
  const tierColumns = [
    {
      title: 'Hạng vé (Tier)',
      dataIndex: 'tierName',
      key: 'tierName',
      render: (text) => <Badge status="processing" text={<b>{text}</b>} />
    },
    {
      // 🚀 GIÁ VÉ NGỒI: Lấy trực tiếp từ Tier
      title: 'Giá vé',
      dataIndex: 'price',
      key: 'price',
      render: (p, r) => <Text >{p?.toLocaleString()} {r.currency}</Text>
    },
    { title: 'Tổng phát hành', dataIndex: 'totalSeats', align: 'center' },
    {
      title: 'Đã bán',
      align: 'center',
      render: (_, t) => <Text strong type="success">{(t.totalSeats || 0) - (t.availableSeats || 0)}</Text>
    },
    {
      title: 'Còn lại',
      dataIndex: 'availableSeats',
      align: 'center',
      render: (val) => <Text type={val === 0 ? "danger" : "default"}>{val}</Text>
    },
    {
      title: 'Tỉ lệ lấp đầy',
      width: 200,
      render: (_, t) => {
        const total = t.totalSeats || 1;
        const sold = total - (t.availableSeats || 0);
        const percent = Math.round((sold / total) * 100);
        return <Progress percent={percent} size="small" strokeColor={percent === 100 ? "#ff4d4f" : "#52c41a"} />;
      }
    }
  ];

  // 2. CỘT CHO BẢNG CHÍNH (Khu vực - Zone)
  const zoneColumns = [
    {
      title: 'Khu vực (Zone)',
      dataIndex: 'zoneName',
      render: (name, r) => (
        <Space>
          <div style={{ width: 12, height: 12, background: r.colorCode || '#ccc', borderRadius: '50%' }}></div>
          <b>{name}</b>
        </Space>
      )
    },
    {
      title: 'Cấu hình',
      dataIndex: 'hasSeatMap',
      render: (hsm) => <Tag color={hsm ? "blue" : "purple"}>{hsm ? "VÉ NGỒI" : "VÉ ĐỨNG"}</Tag>
    },
    {
      // 🚀 LOGIC GIÁ VÉ THÔNG MINH CHO BẢNG CHÍNH
      title: 'Mức giá',
      key: 'zonePrice',
      render: (_, r) => {
        if (!r.hasSeatMap) {
          // Trường hợp 1: Vé đứng -> Lấy giá trực tiếp của Zone
          return <Text>{r.price?.toLocaleString()} {r.currency}</Text>;
        } else {
          // Trường hợp 2: Vé ngồi -> Không hiện giá ở Zone, chỉ hiện ở Tier
          return <Text>— (Xem ở hạng vé) —</Text>;
        }
      }
    },
    { title: 'Tổng vé Zone', dataIndex: 'totalSeats', align: 'center' },
    {
      title: 'Tổng đã bán',
      align: 'center',
      render: (_, r) => <Text strong>{(r.totalSeats || 0) - (r.availableSeats || 0)}</Text>
    },
    {
      title: 'Tổng còn lại',
      dataIndex: 'availableSeats',
      align: 'center',
      render: (val) => <Text type={val === 0 ? "danger" : "warning"} strong>{val}</Text>
    },
    {
      title: 'Tiến độ tổng thể',
      width: 250,
      render: (_, r) => {
        const total = r.totalSeats || 1;
        const sold = total - (r.availableSeats || 0);
        const percent = Math.round((sold / total) * 100);
        return <Progress percent={percent} status={percent === 100 ? "exception" : "normal"} />;
      }
    }
  ];

  return (
    <Card
      title={<><PieChartOutlined /> Phân tích tình trạng vé chi tiết theo Khu vực & Hạng vé</>}
      bordered={false}
      style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
    >
      <Table
        columns={zoneColumns}
        dataSource={zones}
        rowKey="zoneId"
        pagination={false}
        loading={loading}
        size="middle"
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ margin: '10px 0 10px 50px', padding: '10px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <Title level={5} style={{ marginBottom: 12, fontSize: '14px' }}>📊 Chi tiết Giá & Hạng vé của {record.zoneName}:</Title>
              <Table
                columns={tierColumns}
                dataSource={record.tiers || []}
                rowKey="tierId"
                pagination={false}
                size="small"
                locale={{ emptyText: "Khu vực này không phân chia hạng vé" }}
              />
            </div>
          ),
          rowExpandable: (record) => record.tiers && record.tiers.length > 0,
        }}
      />
    </Card>
  );
};

export default TicketZoneStats;