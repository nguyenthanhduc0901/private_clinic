/**
 * Response Handler
 * Chuẩn hóa và xử lý các response từ API
 */

/**
 * Trả về response thành công
 * @param {Object} res Express response object
 * @param {Object|Array} data Dữ liệu trả về
 * @param {string} message Thông báo thành công
 * @param {number} statusCode Mã HTTP Status
 */
const success = (res, data = null, message = 'Thao tác thành công', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Trả về response thành công với phân trang
 * @param {Object} res Express response object
 * @param {Object|Array} data Dữ liệu trả về
 * @param {Object} pagination Thông tin phân trang
 * @param {string} message Thông báo thành công
 * @param {number} statusCode Mã HTTP Status
 */
const successWithPagination = (res, data, pagination, message = 'Thao tác thành công', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        pagination
    });
};

/**
 * Trả về response lỗi
 * @param {Object} res Express response object
 * @param {string} message Thông báo lỗi
 * @param {number} statusCode Mã HTTP Status
 * @param {Object|null} errors Chi tiết lỗi
 */
const error = (res, message = 'Đã xảy ra lỗi', statusCode = 400, errors = null) => {
    const response = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Trả về response lỗi validation
 * @param {Object} res Express response object
 * @param {Object|Array} errors Danh sách lỗi validation
 * @param {string} message Thông báo lỗi
 */
const validationError = (res, errors, message = 'Dữ liệu không hợp lệ') => {
    return res.status(422).json({
        success: false,
        message,
        errors
    });
};

/**
 * Trả về response lỗi không tìm thấy
 * @param {Object} res Express response object
 * @param {string} message Thông báo lỗi
 */
const notFound = (res, message = 'Không tìm thấy tài nguyên yêu cầu') => {
    return res.status(404).json({
        success: false,
        message
    });
};

/**
 * Trả về response lỗi không có quyền
 * @param {Object} res Express response object
 * @param {string} message Thông báo lỗi
 */
const forbidden = (res, message = 'Không có quyền thực hiện thao tác này') => {
    return res.status(403).json({
        success: false,
        message
    });
};

/**
 * Trả về response lỗi chưa xác thực
 * @param {Object} res Express response object
 * @param {string} message Thông báo lỗi
 */
const unauthorized = (res, message = 'Chưa đăng nhập hoặc phiên đăng nhập đã hết hạn') => {
    return res.status(401).json({
        success: false,
        message
    });
};

module.exports = {
    success,
    successWithPagination,
    error,
    validationError,
    notFound,
    forbidden,
    unauthorized
}; 