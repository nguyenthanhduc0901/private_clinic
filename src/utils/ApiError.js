/**
 * Lớp ApiError để xử lý lỗi một cách nhất quán trong ứng dụng
 * Cung cấp cấu trúc lỗi chuẩn hóa cho toàn ứng dụng
 */
class ApiError extends Error {
  /**
   * Khởi tạo một ApiError
   * @param {number} statusCode - Mã trạng thái HTTP
   * @param {string} message - Thông báo lỗi
   * @param {Array|Object} errors - Chi tiết lỗi hoặc danh sách lỗi
   * @param {boolean} isOperational - Xác định lỗi là hoạt động (có thể xử lý) hay lỗi lập trình
   * @param {string} stack - Stack trace
   */
  constructor(statusCode, message, errors = [], isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError; 