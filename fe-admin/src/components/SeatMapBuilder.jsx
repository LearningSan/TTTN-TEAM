import React from 'react';
import { Form, Button, Space, Select, Divider, Typography, Card, Input } from 'antd';
import { Rnd } from 'react-rnd';
import { DeleteOutlined, PlusOutlined, DragOutlined } from '@ant-design/icons';

const { Text } = Typography;

const STAGE_SHAPES = [
  { value: 'rectangle', label: 'Chữ nhật' },
  { value: 'circle', label: 'Tròn / Oval' },
  { value: 't-shape', label: 'Hình chữ T' }
];

const SeatMapBuilder = ({ form }) => {
  const zones = Form.useWatch('zones', form) || [];
  const stages = Form.useWatch('stages', form) || [];

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', borderRadius: 8, marginBottom: 20 }}>
      <Divider titlePlacement="left">🗺️ Thiết lập Sơ đồ & Vị trí</Divider>
      
      <div style={{ 
        width: '100%', 
        height: '550px', 
        background: '#141414', 
        position: 'relative', 
        overflow: 'hidden',
        borderRadius: 12,
        border: '4px solid #000',
        marginBottom: 20,
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
      }}>
        {/* <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', color: '#333', fontWeight: 'bold', fontSize: 20, opacity: 0.5 }}>STAGE AREA</div> */}

        {/* =============== RENDER SÂN KHẤU ================= */}
        {stages.map((stg, idx) => (
          <Rnd
            key={`stg-rnd-${idx}-${stg?.name}`} 
            bounds="parent"
            dragGrid={[10, 10]}
            default={{
              x: stg?.layoutConfig?.x || 300,
              y: stg?.layoutConfig?.y || 20,
              width: stg?.layoutConfig?.w || 200,
              height: stg?.layoutConfig?.h || 80
            }}
            onDragStop={(e, d) => {
              const currentStages = [...(form.getFieldValue('stages') || [])];
              if(currentStages[idx]) {
                currentStages[idx].layoutConfig = { ...(currentStages[idx].layoutConfig || {}), x: d.x, y: d.y };
                form.setFieldsValue({ stages: currentStages });
              }
            }}
            onResizeStop={(e, dir, ref, delta, pos) => {
              const currentStages = [...(form.getFieldValue('stages') || [])];
              if(currentStages[idx]) {
                 currentStages[idx].layoutConfig = { 
                   ...(currentStages[idx].layoutConfig || {}), 
                   w: parseInt(ref.style.width), 
                   h: parseInt(ref.style.height), 
                   x: pos.x, 
                   y: pos.y 
                 };
                 form.setFieldsValue({ stages: currentStages });
              }
            }}
          >
            <div style={{ 
              width: '100%', height: '100%', 
              background: '#434343', color: '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              borderRadius: stg.shape === 'circle' ? '50%' : '4px',
              border: '2px dashed #d9d9d9',
              cursor: 'move',
              zIndex: 10
            }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{stg.name || 'STAGE'}</Text>
            </div>
          </Rnd>
        ))}

        {/* =============== RENDER KHU VỰC ZONES ================= */}
        {zones.map((z, idx) => {
          const isLocked = z?.availableSeats < z?.totalSeats && z?.totalSeats > 0;
          const layout = z.layoutConfig || { x: 50, y: 150, w: 120, h: 60 };
          
          return (
            <Rnd
              key={`zone-rnd-${idx}-${z?.zoneName}`}
              bounds="parent"
              dragGrid={[10, 10]}
              default={{ x: layout.x, y: layout.y, width: layout.w, height: layout.h }}
              disableDragging={isLocked}
              enableResizing={!isLocked}
              onDragStop={(e, d) => {
                const currentZones = [...(form.getFieldValue('zones') || [])];
                if(currentZones[idx]) {
                  currentZones[idx].layoutConfig = { ...(currentZones[idx].layoutConfig || {}), x: d.x, y: d.y };
                  form.setFieldsValue({ zones: currentZones });
                }
              }}
              onResizeStop={(e, dir, ref, delta, pos) => {
                const currentZones = [...(form.getFieldValue('zones') || [])];
                if(currentZones[idx]) {
                  currentZones[idx].layoutConfig = { 
                    ...(currentZones[idx].layoutConfig || {}), 
                    w: parseInt(ref.style.width), 
                    h: parseInt(ref.style.height), 
                    x: pos.x, 
                    y: pos.y 
                  };
                  form.setFieldsValue({ zones: currentZones });
                }
              }}
            >
              {/* 🚀 BỌC MỘT DIV RELATIVE BÊN NGOÀI ĐỂ QUẢN LÝ VỊ TRÍ */}
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                
                {/* 🚀 1. ĐẨY TÊN ZONE LÊN TRÊN KHỐI MÀU (Nằm ngoài khung) */}
                <div style={{ 
                  position: 'absolute', top: -20, left: 0, width: '100%', textAlign: 'center', 
                  color: '#fff', fontSize: 12, fontWeight: 'bold', 
                  textShadow: '0px 1px 4px rgba(0,0,0,0.8)', // Đổ bóng để dễ đọc trên nền tối
                  whiteSpace: 'nowrap', zIndex: 30, 
                  pointerEvents: 'none' // Xuyên chuột qua chữ để không cản trở việc kéo thả
                }}>
                  {z.zoneName || `Zone ${idx + 1}`}
                </div>

                {/* 🚀 2. KHỐI MÀU & LƯỚI GHẾ */}
                <div style={{ 
                  background: z.colorCode || '#1890ff', width: '100%', height: '100%', borderRadius: 6,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff', boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  cursor: isLocked ? 'not-allowed' : 'move', zIndex: 20, 
                  padding: '6px', // Cấp padding để ghế dàn ra không bị cấn vào sát mép viền
                  overflow: 'hidden' 
                }}>
                  
                  {/* 🚀 3. LƯỚI GHẾ TỰ ĐỘNG DÀN ĐỀU (FLEX SPACE-EVENLY) */}
                  {z.hasSeatMap && z.tiers && z.tiers.length > 0 && (
                    <div style={{ 
                      flex: 1, 
                      width: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-evenly', 
                      opacity: 0.9 
                    }}>
                      {z.tiers.map((tier, tIdx) => {
                        // 🚀 BƯỚC 1: ĐẶT HÀM TÍNH TOÁN KÝ TỰ Ở ĐÂY (Bên trong vòng lặp tier)
                        // Hàm này lấy prefix (VD: 'C'), đổi thành số, cộng thêm thứ tự hàng hiện tại, rồi đổi ngược ra chữ lại.
                        const getLabel = (index) => {
                          const prefix = tier.rowPrefix || 'A';
                          let num = 0;
                          for (let i = 0; i < prefix.length; i++) {
                            num = num * 26 + (prefix.charCodeAt(i) - 64);
                          }
                          let currentNum = num + index;
                          let label = '';
                          while (currentNum > 0) {
                            let mod = (currentNum - 1) % 26;
                            label = String.fromCharCode(65 + mod) + label;
                            currentNum = Math.floor((currentNum - mod) / 26);
                          }
                          return label;
                        };

                        // Thay vì dùng React.Fragment, ta dùng thẻ div để bọc màu nền cho nguyên 1 Tier
                        return (
                          <div key={`t-${tIdx}`} style={{
                            flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly',
                            backgroundColor: tier.colorCode ? `${tier.colorCode}66` : 'rgba(255,255,255,0.1)',
                            padding: '2px', borderRadius: '4px',
                            border: `1px dashed ${tier.colorCode || 'rgba(255,255,255,0.3)'}`,
                            width: '100%', marginBottom: 2
                          }}>
                            {/* Vòng lặp vẽ Hàng (Rows) */}
                            {Array.from({ length: tier.rowCount || 0 }).map((_, rIdx) => (
                              <div key={`r-${rIdx}`} style={{ 
                                display: 'flex', 
                                alignItems: 'center', // Đảm bảo chữ và ghế nằm cùng 1 đường ngang
                                width: '100%',
                                gap: '4px' // Khoảng cách giữa chữ và khu vực ghế
                              }}>
                                
                                {/* 🚀 BƯỚC 2: KHỐI CHỨA KÝ TỰ HÀNG (Ở BÊN TRÁI) */}
                                <div style={{ 
                                  width: '15px', color: '#fff', fontSize: '9px', fontWeight: 'bold', 
                                  textAlign: 'center', opacity: 0.8, userSelect: 'none' 
                                }}>
                                  {getLabel(rIdx)}
                                </div>

                                {/* KHU VỰC CHỨA GHẾ (DÀN ĐỀU Ở BÊN PHẢI) */}
                                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-evenly' }}>
                                  {Array.from({ length: tier.seatsPerRow || 0 }).map((_, sIdx) => (
                                    <div key={`s-${sIdx}`} style={{
                                      width: 5, height: 5, borderRadius: '50%',
                                      backgroundColor: tier.colorCode || z.colorCode || '#fff', 
                                      border: '1px solid rgba(255,255,255,0.4)',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                    }} />
                                  ))}
                                </div>
                                
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* NHÃN KHÓA NẾU ĐÃ BÁN VÉ */}
                  {isLocked && <div style={{ fontSize: 8, marginTop: 4, color: '#fff', fontWeight: 'bold' }}>🔒 FIXED</div>}
                </div>

              </div>
            </Rnd>
          );
        })}
      </div>

      <Card size="small" title="Quản lý Khối Sân khấu" variant="borderless" style={{ background: 'transparent' }}>
        <Form.List name="stages">
          {(fields, { add, remove }) => (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ background: '#fff', padding: '5px 10px', borderRadius: 8, border: '1px solid #d9d9d9' }}>
                    <Form.Item {...restField} name={[name, 'name']} noStyle><Input placeholder="Tên" style={{ width: 80 }} /></Form.Item>
                    <Form.Item {...restField} name={[name, 'shape']} noStyle>
                      <Select options={STAGE_SHAPES} style={{ width: 110 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'layoutConfig', 'x']} hidden><Input /></Form.Item>
    <Form.Item {...restField} name={[name, 'layoutConfig', 'y']} hidden><Input /></Form.Item>
    <Form.Item {...restField} name={[name, 'layoutConfig', 'w']} hidden><Input /></Form.Item>
    <Form.Item {...restField} name={[name, 'layoutConfig', 'h']} hidden><Input /></Form.Item>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                  </Space>
                ))}
              </div>
              <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add({ name: 'Sân khấu', shape: 'rectangle', layoutConfig: {x: 300, y: 50, w: 200, h: 80} })}>
                Thêm khối Sân khấu mới
              </Button>
            </>
          )}
        </Form.List>
      </Card>
    </div>
  );
};

export default SeatMapBuilder;