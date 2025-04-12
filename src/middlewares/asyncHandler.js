/**
 * Async Handler Middleware
 * Bọc các hàm xử lý bất đồng bộ để bắt lỗi tự động
 * và chuyển lỗi đến middleware xử lý lỗi tiếp theo
 */

/**
 * Bọc các hàm xử lý bất đồng bộ để bắt lỗi
 * @param {Function} fn - Hàm xử lý route bất đồng bộ (async function)
 * @returns {Function} Hàm middleware có xử lý lỗi
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler; 