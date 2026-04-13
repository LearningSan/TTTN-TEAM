import React, { useEffect, useRef } from 'react';
import { Input, Select } from 'antd';

const UserFilterBar = ({ keyword, setKeyword, filterStatus, setFilterStatus, onFilterTrigger }) => {
  const isFirstRender = useRef(true);

  // Debounce search (Gõ đến đâu lọc đến đó sau 500ms)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const delay = setTimeout(() => { onFilterTrigger(); }, 500);
    return () => clearTimeout(delay);
  }, [keyword]);

  return (
    <div style={{ marginBottom: 16, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Input
        placeholder="Tìm theo email người dùng..."
        allowClear
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ width: 350 }}
      />
      <Select
        placeholder="Lọc theo Trạng thái"
        allowClear
        style={{ width: 200 }}
        value={filterStatus}
        onChange={(val) => { setFilterStatus(val); onFilterTrigger(val); }}
        options={[
          { value: 'ACTIVE', label: 'Hoạt động (ACTIVE)' },
          { value: 'LOCKED', label: 'Đã khóa (LOCKED)' },
        //   { value: 'UNVERIFIED', label: 'Chưa xác thực (UNVERIFIED)' },
        ]}
      />
    </div>
  );
};

export default UserFilterBar;