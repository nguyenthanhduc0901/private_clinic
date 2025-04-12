/**
 * Middleware xử lý lỗi tập trung
 */

/**
 * Xử lý tất cả các loại lỗi và trả về response chuẩn
 * @param {Error} err Đối tượng lỗi
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {Function} next Express next function
 */
module.exports = (err, req, res, next) => {
    console.error(err.stack);
    
    // Lấy HTTP status code từ lỗi hoặc mặc định là 500
    const statusCode = err.statusCode || 500;
    
    // Chuẩn bị response cơ bản
    const errorResponse = {
        success: false,
        message: err.message || 'Đã xảy ra lỗi server'
    };
    
    // Thêm chi tiết lỗi validation nếu có
    if (err.validationErrors) {
        errorResponse.errors = err.validationErrors;
    }
    
    // Xử lý các loại lỗi cụ thể
    
    // Xử lý lỗi JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ'
        });
    }

    // Xử lý lỗi JWT hết hạn
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token đã hết hạn'
        });
    }

    // Xử lý lỗi database
    if (err.code === '23505') { // Unique violation
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu đã tồn tại'
        });
    }

    // Xử lý lỗi database - Foreign key violation
    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            message: 'Không thể xóa dữ liệu vì có liên kết đến dữ liệu khác'
        });
    }
    
    // Trong môi trường production, không trả về lỗi chi tiết
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        errorResponse.message = 'Đã xảy ra lỗi server';
        delete errorResponse.errors;
    } else if (process.env.NODE_ENV !== 'production') {
        // Thêm chi tiết lỗi khi trong môi trường development
        errorResponse.stack = err.stack;
        
        if (err.originalError) {
            errorResponse.originalError = {
                message: err.originalError.message,
                stack: err.originalError.stack
            };
        }
    }
    
    res.status(statusCode).json(errorResponse);
}; 