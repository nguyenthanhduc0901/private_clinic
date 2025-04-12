/**
 * Response Handler
 * Cung cấp các phương thức xử lý response từ API một cách nhất quán
 */

/**
 * Tạo phản hồi thành công
 * @param {Object} res - Express response object
 * @param {*} data - Dữ liệu cần trả về
 * @param {string} message - Thông báo thành công
 * @param {number} statusCode - Mã trạng thái HTTP (mặc định: 200)
 */
const success = (res, data = null, message = 'Thành công', statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    // Kiểm tra xem data có pagination không
    if (data.data && data.pagination) {
      response.data = data.data;
      response.pagination = data.pagination;
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
};

/**
 * Tạo phản hồi lỗi
 * @param {Object} res - Express response object
 * @param {string} message - Thông báo lỗi
 * @param {number} statusCode - Mã trạng thái HTTP (mặc định: 400)
 * @param {Array} errors - Danh sách chi tiết lỗi
 */
const error = (res, message = 'Lỗi', statusCode = 400, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * Tạo phản hồi không tìm thấy
 * @param {Object} res - Express response object
 * @param {string} message - Thông báo không tìm thấy
 */
const notFound = (res, message = 'Không tìm thấy tài nguyên') => {
  return res.status(404).json({
    success: false,
    message
  });
};

/**
 * Tạo phản hồi lỗi xác thực
 * @param {Object} res - Express response object
 * @param {string} message - Thông báo lỗi xác thực
 */
const unauthorized = (res, message = 'Không có quyền truy cập') => {
  return res.status(401).json({
    success: false,
    message
  });
};

/**
 * Tạo phản hồi lỗi cấm truy cập
 * @param {Object} res - Express response object
 * @param {string} message - Thông báo lỗi cấm truy cập
 */
const forbidden = (res, message = 'Bạn không có quyền thực hiện hành động này') => {
  return res.status(403).json({
    success: false,
    message
  });
};

/**
 * Tạo phản hồi tạo mới thành công
 * @param {Object} res - Express response object
 * @param {*} data - Dữ liệu cần trả về
 * @param {string} message - Thông báo thành công
 */
const created = (res, data = null, message = 'Tạo mới thành công') => {
  return success(res, data, message, 201);
};

module.exports = {
  success,
  error,
  notFound,
  unauthorized,
  forbidden,
  created
}; 