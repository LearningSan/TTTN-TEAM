import React from 'react';
import { Modal, Descriptions, Tag, Divider, Table, Space, Typography, Button } from 'antd';

const { Text } = Typography;

const ConcertDetailModal = ({ open, data, loading, onCancel, venues, formatSafeDate }) => {
  return (
    <Modal 
      title={<b style={{fontSize: 20}}>CHI TIẾT: {data?.title}</b>} 
      open={open} 
      onCancel={onCancel} 
      footer={[<Button key="close" type="primary" onClick={onCancel}>Đóng</Button>]} 
      width={1100}
      loading={loading}
    >
      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <Divider orientation="left">Sơ đồ Sân khấu</Divider>
          {(() => {
             // 🚀 Bóc tách dữ liệu từ trường layoutConfig
             let parsedLayout = { stages: [], zoneLayouts: [], canvasConfig: { width: 1100, height: 550 } };
             try { 
               if(data.layoutConfig && data.layoutConfig.startsWith('{')) {
                 parsedLayout = JSON.parse(data.layoutConfig); 
               }
             } catch { console.warn("Lỗi parse layoutConfig"); }
             
             const stages = parsedLayout.stages || [];
             const zoneLayouts = parsedLayout.zoneLayouts || [];
             const zones = data.zones || [];

             return (
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '550px',
                  background: '#141414', 
                  borderRadius: 12, 
                  border: '4px solid #000',
                  overflow: 'hidden', 
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' 
                }}>
                  {/* <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', color: '#333', fontWeight: 'bold', fontSize: 20, opacity: 0.5 }}>STAGE AREA</div> */}

                   {stages.map((stg, i) => {
                      const layout = stg.layoutConfig || {};
                      const stageX = layout.x ?? 300;
                      const stageY = layout.y ?? 20;
                      const stageW = layout.w ?? 200;
                      const stageH = layout.h ?? 80;
                      
                      return (
                        <div 
                          key={`view-stg-${i}`} 
                          style={{ position: 'absolute', left: stageX, top: stageY, width: stageW, height: stageH, zIndex: 10 }}
                        >
                          <div style={{ 
                            width: '100%', height: '100%', background: '#434343', color: '#fff',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            borderRadius: stg.shape === 'circle' ? '50%' : '4px', border: '2px dashed #d9d9d9'
                          }}>
                            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{stg.name || 'Sân khấu'}</Text>
                          </div>
                        </div>
                      );
                   })}

                   {zones.map((z, i) => {
                      const matchedZone = zoneLayouts.find(layoutObj => layoutObj.zoneName === z.zoneName);
                      const layout = matchedZone ? matchedZone.layoutConfig : { x: 0, y: 0, w: 0, h: 0 };
                      return (
                         <div 
                          key={`view-zone-${i}`} 
                          style={{ position: 'absolute', left: layout.x, top: layout.y, width: layout.w, height: layout.h, zIndex: 20 }}
                         >
                            <div style={{ 
                              background: z.colorCode || '#1890ff', color: '#fff', width: '100%', height: '100%', borderRadius: 6,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 'bold', border: '2px solid #fff', boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                            }}>
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '90%', textAlign: 'center' }}>
                                {z.zoneName}
                              </div>
                              <div style={{ fontSize: 9 }}>{z.availableSeats} / {z.totalSeats}</div>
                            </div>
                         </div>
                      );
                   })}
                </div>
             );
          })()}

          <Descriptions bordered column={2} size="small" style={{marginTop: 10}}>
            <Descriptions.Item label="Nghệ sĩ"><b>{data.artist}</b></Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color="blue">{data.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Địa điểm" span={2}>
              {data.venueName || venues.find(v => (v.venueId || v.venue_id) === data.venueId)?.name || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày diễn">{formatSafeDate(data.concertDate)}</Descriptions.Item>
            <Descriptions.Item label="Kết thúc">{formatSafeDate(data.endDate)}</Descriptions.Item>
            <Descriptions.Item label="Mở bán vé">{formatSafeDate(data.saleStartAt)}</Descriptions.Item>
            <Descriptions.Item label="Đóng bán vé">{formatSafeDate(data.saleEndAt)}</Descriptions.Item>
            
            {/* 🚀 Đoạn này render Mô tả đã gọn gàng hơn rất nhiều vì chỉ cần đọc chữ thuần */}
            <Descriptions.Item label="Mô tả" span={2}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{data.description || 'Không có mô tả'}</div>
            </Descriptions.Item>
          </Descriptions>
          
          {/* ... (Đoạn <Divider> và <Table> Cấu trúc Sơ đồ Ghế ở dưới giữ nguyên y hệt cũ) */}
          <Divider orientation="left">Cấu trúc Sơ đồ Ghế & Khu vực (Zones)</Divider>
          <Table 
            dataSource={data.zones || []} 
            rowKey={(r) => r.zoneId || Math.random()} 
            pagination={false} 
            size="small" 
            expandable={{
              expandedRowRender: (record) => (
                <Table 
                  dataSource={record.tiers || []} 
                  rowKey={(t) => t.tierId || Math.random()} 
                  pagination={false} 
                  size="small"
                  columns={[
                    { title: 'Hạng vé', dataIndex: 'tierName', render: (text) => <b>{text}</b> },
                    { title: 'Giá hạng', dataIndex: 'price', render: (p) => <Text>{p?.toLocaleString()} {record.currency}</Text> },
                    { 
                      title: 'Cấu hình ghế',
                      render: (_, t) => record.hasSeatMap 
                        ? <Text >Bắt đầu: {t.rowPrefix} ({t.rowCount} hàng x {t.seatsPerRow} ghế)</Text>
                        : <Text >Vé đứng</Text>
                    },{
                    title: 'Tình trạng Hạng vé',
                    render: (_, t) => {
                      const total = t.totalSeats || 0;
                      const available = t.availableSeats || 0;
                      const booked = total - available;
                      return (
                        <Space direction="vertical" size={0}>
                          <Text strong style={{ fontSize: 12 }}>Tổng: {total}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>Đã bán: {booked}</Text>
                          <Text type={available > 0 ? 'success' : 'danger'} style={{ fontSize: 12 }}>Còn trống: {available}</Text>
                        </Space>
                      );
                    }}
                  ]}
                />
              ),
              rowExpandable: (record) => record.tiers && record.tiers.length > 0,
            }}
            columns={[
              { 
                title: 'Khu vực (Zone)', 
                dataIndex: 'zoneName',
                render: (name, record) => <Space><div style={{width: 12, height: 12, background: record.colorCode || '#ccc', borderRadius: '50%'}}></div> <b>{name}</b></Space>
              },
              { 
  title: 'Mức giá', 
  key: 'price', 
  render: (_, r) => {
    if (!r.hasSeatMap) {
      return <Text strong>{r.price?.toLocaleString()} {r.currency}</Text>;
    } else {
      return <Text>— (Xem ở Hạng vé) —</Text>;
    }
  }
},
              { 
                title: 'Loại vé', 
                dataIndex: 'hasSeatMap', 
                render: (hsm) => <Tag color={hsm ? "blue" : "purple"}>{hsm ? "Vé ngồi" : "Vé đứng"}</Tag> 
              },
              { 
                title: 'Tình trạng', 
                render: (_, r) => {
                  const total = r.totalSeats || 0;
                  const available = r.availableSeats || 0;
                  const booked = total - available;
                  return (
                    <Space direction="vertical" size={0}>
                      <Text strong>Tổng: {total}</Text>
                      <Text type="secondary">Đã đặt: {booked}</Text>
                      <Text type={available > 0 ? 'success' : 'danger'}>Còn: {available}</Text>
                    </Space>
                  );
                }
              }
            ]} 
          />
        </div>
      )}
    </Modal>
  );
};

export default ConcertDetailModal;