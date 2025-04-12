/**
 * Middleware xử lý validation từ express-validator
 * Lấy các kết quả validation và trả về lỗi nếu có
 */
const { validationResult } = require('express-validator');

/**
 * Middleware kiểm tra kết quả validation và trả về lỗi nếu có
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

module.exports = validateMiddleware; 