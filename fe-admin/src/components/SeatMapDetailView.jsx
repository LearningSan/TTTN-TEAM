import React from 'react';
import { Typography, Spin } from 'antd';
const { Text } = Typography;

const SeatMapDetailView = ({ data, bookedSeats, loadingSeats }) => {
  if (!data) return null;

  // 🚀 Parse layoutConfig để lấy tọa độ x, y, w, h
  let parsedLayout = { stages: [], zoneLayouts: [] };
  try {
    if (data.layoutConfig && data.layoutConfig.startsWith('{')) {
      parsedLayout = JSON.parse(data.layoutConfig);
    }
  } catch { console.warn("Lỗi parse layoutConfig"); }

  const stages = parsedLayout.stages || [];
  const zoneLayouts = parsedLayout.zoneLayouts || [];
  const zones = data.zones || [];

  return (
    <Spin spinning={loadingSeats} tip="Đang đồng bộ dữ liệu ghế...">
      <div style={{
        position: 'relative', width: '100%', height: '550px',
        background: '#141414', borderRadius: 12, border: '4px solid #000',
        overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
      }}>
        {/* 1. Vẽ Sân khấu */}
        {stages.map((stg, i) => (
          <div key={`stg-${i}`} style={{ 
            position: 'absolute', 
            left: stg.layoutConfig?.x ?? 300, 
            top: stg.layoutConfig?.y ?? 20, 
            width: stg.layoutConfig?.w ?? 200, 
            height: stg.layoutConfig?.h ?? 80, 
            zIndex: 10 
          }}>
            <div style={{
              width: '100%', height: '100%', background: '#434343', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: stg.shape === 'circle' ? '50%' : '4px', border: '2px dashed #d9d9d9'
            }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{stg.name || 'Sân khấu'}</Text>
            </div>
          </div>
        ))}

        {/* 2. Vẽ Khu vực (Zones) & Từng Hạng vé (Tiers) */}
        {zones.map((z, i) => {
          const matchedZone = zoneLayouts.find(layoutObj => layoutObj.zoneName === z.zoneName);
          const layout = matchedZone ? matchedZone.layoutConfig : { x: 0, y: 0, w: 0, h: 0 };

          return (
            <div key={`zone-${i}`} style={{ position: 'absolute', left: layout.x, top: layout.y, width: layout.w, height: layout.h, zIndex: 20 }}>
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                
                {/* 🚀 HIỆN VÉ CÒN / VÉ TỔNG */}
                <div style={{ position: 'absolute', top: -20, left: 0, width: '100%', textAlign: 'center', color: '#fff', fontSize: 12, fontWeight: 'bold', textShadow: '0px 1px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', zIndex: 30 }}>
                  {z.zoneName} ({z.availableSeats}/{z.totalSeats})
                </div>

                <div style={{
                  background: z.colorCode || '#1890ff', width: '100%', height: '100%', borderRadius: 6,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', padding: '6px', overflow: 'hidden'
                }}>

                  {/* 🚀 RENDER LƯỚI GHẾ THEO MÀU TIER */}
                  {z.hasSeatMap && z.tiers && z.tiers.length > 0 ? (
                    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', opacity: 0.9 }}>
                      {[...z.tiers]
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map((tier, tIdx) => {
                        
                        // 🚀 LOGIC TÍNH KÝ TỰ HÀNG THEO ROWPREFIX
                        const getLabel = (rIndex) => {
                          const prefix = tier.rowPrefix || 'A';
                          let num = 0;
                          for (let j = 0; j < prefix.length; j++) num = num * 26 + (prefix.charCodeAt(j) - 64);
                          let currentNum = num + rIndex;
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
                            // 🚀 HIỆN MÀU SẮC TIER (vùng màu của hạng vé)
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
                                      const seatLabel = `${rowLetter}${sIdx + 1}`;
                                      // 🚀 CHECK GHẾ ĐÃ BÁN (Màu đỏ rực rỡ)
                                      const isBooked = bookedSeats.includes(seatLabel);

                                      return (
                                        <div key={`s-${sIdx}`} style={{
                                          width: 5, height: 5, borderRadius: '50%',
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
                    <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 10, opacity: 0.8 }}>KHU VÉ ĐỨNG</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Spin>
  );
};

export default SeatMapDetailView;