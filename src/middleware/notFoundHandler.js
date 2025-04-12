/**
 * Middleware xử lý lỗi 404 Not Found
 */
module.exports = (req, res, next) => {
    res.status(404).json({
        message: 'Không tìm thấy tài nguyên yêu cầu'
    });
}; 