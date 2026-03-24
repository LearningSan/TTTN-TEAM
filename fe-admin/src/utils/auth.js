// Lưu bộ 3 vào máy khách
export const saveToken = (accessToken, refreshToken, userId) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  if (userId) localStorage.setItem('userId', userId);
};

// Xóa sạch khi đăng xuất
export const clearToken = () => {
  localStorage.clear();
};

// Các hàm lấy dữ liệu ra để dùng
export const getAccessToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const getUserId = () => localStorage.getItem('userId');