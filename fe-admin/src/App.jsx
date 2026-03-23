import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/Login';
import AdminDashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang Login: AI CŨNG VÀO ĐƯỢC */}
        <Route path="/login" element={<AdminLogin />} />

        {/* VÙNG BẢO VỆ: CHỈ ADMIN CÓ TOKEN MỚI VÀO ĐƯỢC */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/tickets" element={<div>Trang Quản lý vé</div>} />
        </Route>

        {/* Mặc định nếu gõ sai URL thì về Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;