import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import ConcertManagement from './pages/ConcertManagement';

function App() {
  return (
    <Routes>
      {/* 1. Mặc định vào trang chủ (/) -> Ép chuyển hướng thẳng ra Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 2. Tuyến đường duy nhất không cần bảo vệ */}
      <Route path="/login" element={<Login />} />

      {/* 3. VÙNG CẤM (Chỉ ADMIN mới được vào) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/concerts" element={<ConcertManagement />} />
          <Route path="/dashboard/tickets" element={<div>Trang quản lý vé</div>} />
        </Route>
      </Route>

      {/* 4. CHỐT CHẶN CUỐI CÙNG: Người dùng gõ link bậy bạ (ví dụ: /abc-xyz) -> Tống ra Login hết */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;