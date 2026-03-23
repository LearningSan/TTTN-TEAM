import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
const ProtectedRoute = () => {
  const token = localStorage.getItem('accessToken');

  // Nếu không có token, bắt quay về trang login của admin
  if (!token) {
    return <Navigate to="/login" replace />;
  }
let isAuthorized = false;
  try {
    const decoded = jwtDecode(token);
    // Kiểm tra role từ payload: { "role": "ADMIN", ... }
    if (decoded.role === 'ADMIN') {
      isAuthorized = true;
    }
  } catch (error) {
    console.error("Token invalid:", error);
    localStorage.clear();
    isAuthorized = false;
  }
  return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;