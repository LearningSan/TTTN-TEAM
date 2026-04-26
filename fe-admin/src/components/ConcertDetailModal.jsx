import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Divider, Table, Space, Typography, Button,Spin } from 'antd';
import API from '../api/config';
const { Text } = Typography;

const ConcertDetailModal = ({ open, data, loading, onCancel, venues, formatSafeDate }) => {
  // 🚀 TẠO STATE LƯU MẢNG GHẾ ĐÃ BÁN
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // 🚀 GỌI API LẤY VÉ KHI MỞ MODAL
  useEffect(() => {
    if (open && data?.concertId) {
      const fetchBookedSeats = async () => {
        setLoadingSeats(true);
        try {
          // Gọi API lấy maximum vé (ví dụ size=5000) để map lên sơ đồ
          const res = await API.get(`/admin/concerts/${data.concertId}/tickets?size=5000`);
          const tickets = res.data?.content || [];
          
          // Lọc ra các vé không bị Hủy và gom seatLabel vào 1 mảng
          const seats = tickets
            .filter(t => t.status !== 'CANCELLED' && t.seatLabel)
            .map(t => t.seatLabel);
            
          setBookedSeats(seats);
        } catch (error) {
          console.error("Lỗi lấy danh sách ghế:", error);
        } finally {
          setLoadingSeats(false);
        }
      };
      fetchBookedSeats();
    } else {
      setBookedSeats([]); // Reset khi đóng modal
    }
  }, [open, data]);
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
              <Spin spinning={loadingSeats} tip="Đang đồng bộ dữ liệu ghế...">
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
                            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                              
                              {/* TÊN ZONE NẰM TRÊN CÙNG */}
                              <div style={{ position: 'absolute', top: -20, left: 0, width: '100%', textAlign: 'center', color: '#fff', fontSize: 12, fontWeight: 'bold', textShadow: '0px 1px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', zIndex: 30 }}>
                                {z.zoneName} ({z.availableSeats}/{z.totalSeats})
                              </div>

                              <div style={{ 
                                background: z.colorCode || '#1890ff', width: '100%', height: '100%', borderRadius: 6,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid #fff', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', padding: '6px', overflow: 'hidden'
                              }}>
                                
                                {/* 🚀 RENDER LƯỚI GHẾ NẾU LÀ VÉ NGỒI */}
                                {z.hasSeatMap && z.tiers && z.tiers.length > 0 ? (
                                  <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', opacity: 0.9 }}>
                                    {z.tiers.map((tier, tIdx) => {
                                      // HÀM TÍNH KÝ TỰ HÀNG (A, B, C...)
                                      const getLabel = (index) => {
                                        const prefix = tier.rowPrefix || 'A';
                                        let num = 0;
                                        for (let i = 0; i < prefix.length; i++) num = num * 26 + (prefix.charCodeAt(i) - 64);
                                        let currentNum = num + index;
                                        let label = '';
                                        while (currentNum > 0) {
                                          let mod = (currentNum - 1) % 26;
                                          label = String.fromCharCode(65 + mod) + label;
                                          currentNum = Math.floor((currentNum - mod) / 26);
                                        }
                                        return label;
                                      };

                                      return (
                                        <div key={`t-${tIdx}`} style={{
                                          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly',
                                          backgroundColor: tier.colorCode ? `${tier.colorCode}66` : 'rgba(255,255,255,0.1)',
                                          padding: '2px', borderRadius: '4px', border: `1px dashed ${tier.colorCode || 'rgba(255,255,255,0.3)'}`, width: '100%', marginBottom: 2
                                        }}>
                                          {Array.from({ length: tier.rowCount || 0 }).map((_, rIdx) => {
                                            const rowLetter = getLabel(rIdx);
                                            return (
                                              <div key={`r-${rIdx}`} style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '4px' }}>
                                                {/* Ký tự hàng */}
                                                <div style={{ width: '15px', color: '#fff', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', opacity: 0.8 }}>
                                                  {rowLetter}
                                                </div>
                                                {/* Lưới ghế */}
                                                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-evenly' }}>
                                                  {Array.from({ length: tier.seatsPerRow || 0 }).map((_, sIdx) => {
                                                    
                                                    // 🚀 BƯỚC QUAN TRỌNG: TẠO MÃ GHẾ ĐỂ SO SÁNH (Ví dụ: A1, B2)
                                                    const seatLabel = `${rowLetter}${sIdx + 1}`; 
                                                    
                                                    // 🚀 CHECK GHẾ ĐÃ BÁN (Dùng state bookedSeats từ API)
                                                    const isBooked = bookedSeats.includes(seatLabel); 

                                                    return (
                                                      <div key={`s-${sIdx}`} style={{
                                                        width: 5, height: 5, borderRadius: '50%',
                                                        // Đổi thành màu Đỏ (#ff4d4f) nếu đã bán
                                                        backgroundColor: isBooked ? '#ff4d4f' : (tier.colorCode || z.colorCode || '#fff'), 
                                                        border: '1px solid rgba(255,255,255,0.4)',
                                                        boxShadow: isBooked ? '0 0 4px #ff4d4f' : '0 1px 2px rgba(0,0,0,0.2)'
                                                      }} />
                                                    )
                                                  })}
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 10, opacity: 0.8 }}>
                                    KHU VÉ ĐỨNG
                                  </div>
                                )}
                              </div>
                            </div>
                         </div>
                      );
                   })}
                </div></Spin>
             );
          })()}

          <Descriptions bordered column={2} size="small" style={{marginTop: 10}}>
            <Descriptions.Item label="Nghệ sĩ"><b>{data.artist}</b></Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color="blue">{data.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Địa điểm" span={2}>
              {data.venueName || venues.find(v => (v.venueId || v.venue_id) === data.venueId)?.name || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Mở bán vé">{formatSafeDate(data.saleStartAt)}</Descriptions.Item>
            <Descriptions.Item label="Đóng bán vé">{formatSafeDate(data.saleEndAt)}</Descriptions.Item>
            <Descriptions.Item label="Ngày diễn">{formatSafeDate(data.concertDate)}</Descriptions.Item>
            <Descriptions.Item label="Kết thúc">{formatSafeDate(data.endDate)}</Descriptions.Item>
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