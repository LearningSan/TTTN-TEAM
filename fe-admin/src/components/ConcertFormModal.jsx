import React from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Divider,
  Card,
  Tag,
  Space,
  Button,
  Switch,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import SeatMapBuilder from "./SeatMapBuilder"; // Gọi trực tiếp Builder đệ đã làm

const { Text } = Typography;

const ConcertFormModal = ({
  open,
  modalId,
  onCancel,
  form,
  onFinish,
  loading,
  venues,
  zoneColors,
}) => {
  // Logic tự động nhảy Dãy ghế (A -> B -> C) được gói gọn vào đây
  const getNextPrefixInZone = (zoneIndex) => {
    const zones = form.getFieldValue("zones") || [];
    const targetZone = zones[zoneIndex];
    if (!targetZone || !targetZone.tiers || targetZone.tiers.length === 0)
      return "A";

    let maxIndexInZone = 0;
    targetZone.tiers.forEach((t) => {
      if (t && t.rowPrefix && t.rowCount) {
        const prefix = t.rowPrefix.toUpperCase();
        let startIndex = 0;
        for (let i = 0; i < prefix.length; i++)
          startIndex = startIndex * 26 + (prefix.charCodeAt(i) - 64);
        const endIndex = startIndex + t.rowCount - 1;
        if (endIndex > maxIndexInZone) maxIndexInZone = endIndex;
      }
    });

    let nextVal = maxIndexInZone + 1;
    let nextPrefix = "";
    while (nextVal > 0) {
      let mod = (nextVal - 1) % 26;
      nextPrefix = String.fromCharCode(65 + mod) + nextPrefix;
      nextVal = Math.floor((nextVal - mod) / 26);
    }
    return nextPrefix;
  };

  return (
    <Modal
      title={modalId ? "SỬA THÔNG TIN CONCERT" : "TẠO CONCERT MỚI"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1100}
      destroyOnClose
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Divider orientation="left">1. Thông tin chung</Divider>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "16px",
          }}
        >
          <Form.Item
            name="title"
            label="Tên chương trình"
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item name="artist" label="Nghệ sĩ" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="venueId"
            label="Địa điểm"
            rules={[{ required: true }]}
          >
            <Select
              size="large"
              showSearch
              optionFilterProp="label"
              options={venues.map((v) => ({
                value: v.venueId || v.venue_id,
                label: v.name || v.venueName,
              }))}
            />
          </Form.Item>
        </div>

        <Divider orientation="left">2. Thời gian bán vé và diễn</Divider>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "16px",
          }}
        >
          <Form.Item
            name="saleStartAt"
            label="Mở bán vé"
            rules={[{ required: true }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>
          <Form.Item
            name="saleEndAt"
            label="Đóng bán vé"
            dependencies={["saleStartAt"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value.isAfter(getFieldValue("saleStartAt")))
                    return Promise.resolve();
                  return Promise.reject(
                    new Error("Kết thúc bán phải SAU khi bắt đầu bán!"),
                  );
                },
              }),
            ]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>
          <Form.Item
            name="concertDate"
            label="Ngày diễn"
            dependencies={["saleEndAt"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value.isAfter(getFieldValue("saleEndAt")))
                    return Promise.resolve();
                  return Promise.reject(
                    new Error("Ngày diễn phải SAU khi đóng bán vé!"),
                  );
                },
              }),
            ]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Kết thúc diễn"
            dependencies={["concertDate"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value.isAfter(getFieldValue("concertDate")))
                    return Promise.resolve();
                  return Promise.reject(
                    new Error("Kết thúc diễn phải SAU khi bắt đầu diễn!"),
                  );
                },
              }),
            ]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>
        </div>

        <Divider orientation="left">3. Xây dựng Sơ đồ & Giá vé</Divider>
        <Form.List name="zones">
          {(zoneFields, { add: addZone, remove: removeZone }) => (
            <>
              {zoneFields.map(({ key: zKey, name: zName, ...restZField }) => (
                <Form.Item noStyle shouldUpdate key={zKey}>
                  {() => {
                    const currentZone =
                      form.getFieldValue(["zones", zName]) || {};
                    const isZoneLocked =
                      currentZone.totalSeats > 0 &&
                      currentZone.availableSeats < currentZone.totalSeats;
                    const hasSeatMap = currentZone.hasSeatMap;
                    const activeColor = currentZone.colorCode || "#d9d9d9";

                    return (
                      <Card
                        size="small"
                        style={{
                          marginBottom: 20,
                          borderLeft: `6px solid ${activeColor}`,
                          background: isZoneLocked ? "#fff1f0" : "#fcfcfc",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}
                        title={
                          <Space>
                            <b style={{ fontSize: 16 }}>Khu vực #{zName + 1}</b>{" "}
                            {isZoneLocked && (
                              <Tag color="red">
                                🔒 Đã bán vé - Khóa cấu trúc
                              </Tag>
                            )}
                          </Space>
                        }
                        extra={
                          !isZoneLocked &&
                          zoneFields.length > 1 && (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeZone(zName)}
                            >
                              Xóa Khu vực
                            </Button>
                          )
                        }
                      >
                        <Form.Item
                          {...restZField}
                          name={[zName, "zoneId"]}
                          hidden
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...restZField}
                          name={[zName, "layoutConfig", "x"]}
                          hidden
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...restZField}
                          name={[zName, "layoutConfig", "y"]}
                          hidden
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...restZField}
                          name={[zName, "layoutConfig", "w"]}
                          hidden
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...restZField}
                          name={[zName, "layoutConfig", "h"]}
                          hidden
                        >
                          <Input />
                        </Form.Item>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr",
                            gap: "12px",
                            marginTop: 8,
                            marginBottom: 16,
                          }}
                        >
                          <Form.Item
                            {...restZField}
                            name={[zName, "zoneName"]}
                            label="Tên Khu vực"
                            rules={[{ required: true }]}
                          >
                            <Input disabled={isZoneLocked} />
                          </Form.Item>
                          {!hasSeatMap && (
                            <>
                              <Form.Item
                                {...restZField}
                                name={[zName, "price"]}
                                label="Giá khu vực"
                                rules={[{ required: true }]}
                              >
                                <InputNumber
                                  disabled={isZoneLocked}
                                  min={0}
                                  style={{ width: "100%" }}
                                  // formatter={(v) =>
                                  //   `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                  // }
                                  step={0.000001} // Thêm cái này để hỗ trợ gõ số nhỏ mượt hơn
                                  stringMode     // Giúp xử lý số cực nhỏ mà không bị chuyển sang dạng 1e-6
                                />
                              </Form.Item>
                              <Form.Item
                                {...restZField}
                                name={[zName, "currency"]}
                                label="Tiền tệ"
                                rules={[{ required: true }]}
                              >
                                <Select
                                  disabled={isZoneLocked}
                                  options={[
                                    { value: "ETH", label: "ETH" },
                                    { value: "USDT", label: "USDT" },
                                    { value: "BNB", label: "BNB" },
                                  ]}
                                />
                              </Form.Item>
                            </>
                          )}

                          <Form.Item
                            {...restZField}
                            name={[zName, "colorCode"]}
                            label="Màu khu vực"
                            rules={[{ required: true }]}
                          >
                            <Select
                              disabled={isZoneLocked}
                              options={zoneColors.map((c) => ({
                                value: c.value,
                                label: (
                                  <Space>
                                    <div
                                      style={{
                                        width: 12,
                                        height: 12,
                                        background: c.value,
                                        borderRadius: "50%",
                                      }}
                                    ></div>
                                    {c.label}
                                  </Space>
                                ),
                              }))}
                            />
                          </Form.Item>
                        </div>

                        <div
                          style={{
                            background: "#fff",
                            padding: 16,
                            borderRadius: 8,
                            border: "1px solid #e8e8e8",
                          }}
                        >
                          <Form.Item
                            {...restZField}
                            name={[zName, "hasSeatMap"]}
                            label="Loại khu vực"
                            valuePropName="checked"
                          >
                            <Switch
                              disabled={isZoneLocked}
                              checkedChildren="🎫 VÉ NGỒI"
                              unCheckedChildren="🏃 VÉ ĐỨNG"
                            />
                          </Form.Item>
                          {hasSeatMap && (
                            <>
                              <Form.Item
                                {...restZField}
                                name={[zName, "price"]}
                                hidden
                              >
                                <InputNumber />
                              </Form.Item>
                              <Form.Item
                                {...restZField}
                                name={[zName, "currency"]}
                                hidden
                              >
                                <Input />
                              </Form.Item>
                            </>
                          )}
                          {!hasSeatMap ? (
                            <div
                              style={{
                                background: "#e6f7ff",
                                padding: 12,
                                borderRadius: 6,
                              }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: "16px",
                                }}
                              >
                                <Form.Item
                                  {...restZField}
                                  name={[zName, "area"]}
                                  label="Diện tích Khu vực (m²)"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Vui lòng nhập diện tích!",
                                    },
                                  ]}
                                >
                                  <InputNumber
                                    disabled={isZoneLocked}
                                    min={1}
                                    style={{ width: "100%" }}
                                    addonAfter="m²"
                                    onChange={(val) => {
                                      // Tự động ép số vé xuống mức an toàn nếu diện tích bị thu hẹp
                                      const currentZones =
                                        form.getFieldValue("zones");
                                      if (
                                        currentZones[zName].totalSeats >
                                        val * 2
                                      ) {
                                        currentZones[zName].totalSeats =
                                          val * 2;
                                        form.setFieldsValue({
                                          zones: currentZones,
                                        });
                                        message.info(
                                          `Hệ thống đã tự động điều chỉnh số vé xuống ${val * 2} theo diện tích mới!`,
                                        );
                                      }
                                    }}
                                  />
                                </Form.Item>

                                <Form.Item
                                  {...restZField}
                                  name={[zName, "totalSeats"]}
                                  label="Tổng vé phát hành tối đa"
                                  dependencies={[["zones", zName, "area"]]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Vui lòng nhập số vé!",
                                    },
                                    ({ getFieldValue }) => ({
                                      validator(_, value) {
                                        const area = getFieldValue([
                                          "zones",
                                          zName,
                                          "area",
                                        ]);
                                        if (!area)
                                          return Promise.reject(
                                            new Error(
                                              "⚠️ Phải nhập diện tích trước!",
                                            ),
                                          );
                                        if (!value || value <= area * 2)
                                          return Promise.resolve();
                                        return Promise.reject(
                                          new Error(
                                            `Vượt giới hạn an toàn! Tối đa ${area * 2} vé.`,
                                          ),
                                        );
                                      },
                                    }),
                                  ]}
                                >
                                  <InputNumber
                                    disabled={isZoneLocked}
                                    min={1}
                                    style={{ width: "100%" }}
                                    addonAfter="Vé"
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          ) : (
                            <Form.List name={[zName, "tiers"]}>
                              {(
                                tierFields,
                                { add: addTier, remove: removeTier },
                              ) => (
                                <>
                                  {tierFields.map(
                                    (
                                      { key: tKey, name: tName, ...restTField },
                                      index,
                                    ) => (
                                      <div
                                        key={tKey}
                                        style={{
                                          background: "#fafafa",
                                          padding: 12,
                                          marginBottom: 12,
                                          borderRadius: 6,
                                          border: "1px dashed #d9d9d9",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginBottom: 8,
                                          }}
                                        >
                                          <Text strong>
                                            📌 Phân Hạng (Tier) #{index + 1}
                                          </Text>
                                          {!isZoneLocked &&
                                            tierFields.length > 1 && (
                                              <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() =>
                                                  removeTier(tName)
                                                }
                                                size="small"
                                              />
                                            )}
                                        </div>
                                        <Form.Item
                                          {...restTField}
                                          name={[tName, "tierId"]}
                                          hidden
                                        >
                                          <Input />
                                        </Form.Item>
                                        <div
                                          style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                              "1fr 1fr 1fr 1fr",
                                            gap: "12px",
                                          }}
                                        >
                                          <Form.Item
                                            {...restTField}
                                            name={[tName, "tierName"]}
                                            label="Tên Hạng"
                                            rules={[{ required: true }]}
                                          >
                                            <Select
                                              disabled={isZoneLocked}
                                              placeholder="-- Chọn hạng vé --"
                                            >
                                              <Select.Option value="VIP">
                                                VIP
                                              </Select.Option>
                                              <Select.Option value="MID">
                                                MID
                                              </Select.Option>
                                              <Select.Option value="STANDARD">
                                                STANDARD
                                              </Select.Option>
                                            </Select>
                                          </Form.Item>
                                          <Form.Item
                                            {...restTField}
                                            name={[tName, "price"]}
                                            label="Giá hạng"
                                            rules={[{ required: true }]}
                                          >
                                            <InputNumber
                                              disabled={isZoneLocked}
                                              min={0}
                                              style={{ width: "100%" }}
                                              // formatter={(v) =>
                                              //   `${v}`.replace(
                                              //     /\B(?=(\d{3})+(?!\d))/g,
                                              //     ",",
                                              //   )
                                              // }
                                              step={0.000001} // Thêm cái này để hỗ trợ gõ số nhỏ mượt hơn
                                              stringMode     // Giúp xử lý số cực nhỏ mà không bị chuyển sang dạng 1e-6
                                              onChange={(val) => {
                                                // Đồng bộ Giá lên Zone nếu là Tier đầu tiên
                                                if (index === 0) {
                                                  const currentZones =
                                                    form.getFieldValue("zones");
                                                  currentZones[zName].price =
                                                    val;
                                                  form.setFieldsValue({
                                                    zones: currentZones,
                                                  });
                                                }
                                              }}
                                            />
                                          </Form.Item>
                                          <Form.Item
                                            {...restTField}
                                            name={[tName, "currency"]}
                                            label="Tiền tệ"
                                            rules={[{ required: true }]}
                                            initialValue="ETH"
                                          >
                                            <Select
                                              disabled={isZoneLocked}
                                              options={[
                                                { value: "ETH", label: "ETH" },
                                                {
                                                  value: "USDT",
                                                  label: "USDT",
                                                },

                                                { value: "BNB", label: "BNB" },
                                              ]}
                                              onChange={(val) => {
                                                // Đồng bộ Tiền tệ lên Zone nếu là Tier đầu tiên
                                                if (index === 0) {
                                                  const currentZones =
                                                    form.getFieldValue("zones");
                                                  currentZones[zName].currency =
                                                    val;
                                                  form.setFieldsValue({
                                                    zones: currentZones,
                                                  });
                                                }
                                              }}
                                            />
                                          </Form.Item>
                                          <Form.Item
                                            {...restTField}
                                            name={[tName, "colorCode"]}
                                            label="Màu hạng vé"
                                            rules={[{ required: true }]}
                                            initialValue={currentZone.colorCode} // Mặc định lấy theo màu của Zone
                                          >
                                            <Select
                                              disabled={isZoneLocked}
                                              options={zoneColors.map((c) => ({
                                                value: c.value,
                                                label: (
                                                  <Space>
                                                    <div
                                                      style={{
                                                        width: 12,
                                                        height: 12,
                                                        background: c.value,
                                                        borderRadius: "50%",
                                                      }}
                                                    ></div>
                                                    {c.label}
                                                  </Space>
                                                ),
                                              }))}
                                            />
                                          </Form.Item>
                                        </div>
                                        <div
                                          style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr 1fr",
                                            gap: "12px",
                                          }}
                                        >
                                          <Form.Item
                                            {...restTField}
                                            name={[tName, "rowPrefix"]}
                                            label="Bắt đầu"
                                            rules={[{ required: true }]}
                                          >
                                            <Input
                                              disabled={isZoneLocked}
                                              style={{
                                                textTransform: "uppercase",
                                                fontWeight: "bold",
                                              }}
                                            />
                                          </Form.Item>
                                          <Form.Item
                                            {...restTField}
                                            name={[tName, "rowCount"]}
                                            label="Số hàng"
                                            rules={[{ required: true }]}
                                          >
                                            <InputNumber
                                              disabled={isZoneLocked}
                                              min={1}
                                              style={{ width: "100%" }}
                                            />
                                          </Form.Item>
                                          <Form.Item
                                            {...restTField}
                                            name={[tName, "seatsPerRow"]}
                                            label="Ghế/Hàng"
                                            rules={[{ required: true }]}
                                          >
                                            <InputNumber
                                              disabled={isZoneLocked}
                                              min={1}
                                              style={{ width: "100%" }}
                                            />
                                          </Form.Item>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                  {!isZoneLocked && (
                                    <Button
                                      type="dashed"
                                      onClick={() =>
                                        addTier({
                                          price: currentZone.price || 0,
                                          rowPrefix: getNextPrefixInZone(zName),
                                          rowCount: 1,
                                          seatsPerRow: 2,
                                        })
                                      }
                                      block
                                      icon={<PlusOutlined />}
                                    >
                                      Thêm Phân Hạng
                                    </Button>
                                  )}
                                </>
                              )}
                            </Form.List>
                          )}
                        </div>
                      </Card>
                    );
                  }}
                </Form.Item>
              ))}
              <Button
                type="dashed"
                onClick={() =>
                  addZone({
                    zoneName: `Khu vực ${zoneFields.length + 1}`,
                    price: 0.000001,
                    currency: "ETH",
                    colorCode:
                      zoneColors[zoneFields.length % zoneColors.length].value,
                    hasSeatMap: true,
                    layoutConfig: { x: 50, y: 150, w: 120, h: 60 },
                    tiers: [
                      {
                        price: 0.000001,
                        rowPrefix: "A",
                        rowCount: 1,
                        seatsPerRow: 2,
                      },
                    ],
                  })
                }
                block
                icon={<PlusOutlined />}
                style={{ height: 40, borderColor: "#1890ff", color: "#1890ff" }}
              >
                Thêm Khu Vực Mới
              </Button>
            </>
          )}
        </Form.List>

        <Divider orientation="left">4. Khác</Divider>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <Form.Item name="bannerURL" label="Ảnh Banner">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select
              options={[
                "DRAFT",
                "ON_SALE",
                "COMPLETED",
                "CANCELLED",
                "SOLD_OUT",
              ].map((v) => ({ value: v, label: v }))}
            />
          </Form.Item>
        </div>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} />
        </Form.Item>
        <SeatMapBuilder form={form} />
        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loading}
          style={{ height: 50, fontSize: 16 }}
        >
          XÁC NHẬN
        </Button>
      </Form>
    </Modal>
  );
};

export default ConcertFormModal;
