import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Kích hoạt plugin để xử lý format riêng từ Backend
dayjs.extend(customParseFormat);

/**
 * Định dạng chuẩn từ Backend: "DD/MM/YYYY HH:mm:ss"
 * Định dạng hiển thị mặc định: "DD/MM/YYYY HH:mm"
 */
export const formatDateTime = (dateStr, outputFormat = 'DD/MM/YYYY HH:mm') => {
  if (!dateStr) return '-';
  
  // Parse chuỗi ngày từ BE kèm theo format gốc
  const parsedDate = dayjs(dateStr, "DD/MM/YYYY HH:mm:ss");
  
  // Nếu hợp lệ thì trả về format mong muốn, ngược lại trả về chuỗi gốc
  return parsedDate.isValid() ? parsedDate.format(outputFormat) : dateStr;
};

/**
 * Hàm chỉ lấy ngày (không lấy giờ)
 */
export const formatDateOnly = (dateStr) => {
  return formatDateTime(dateStr, 'DD/MM/YYYY');
};

export default dayjs;