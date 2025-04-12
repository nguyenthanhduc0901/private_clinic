/**
 * Validators
 * Các hàm kiểm tra dữ liệu đầu vào
 */

/**
 * Kiểm tra email hợp lệ
 * @param {string} email Email cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Kiểm tra số điện thoại hợp lệ
 * @param {string} phone Số điện thoại cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
const isValidPhone = (phone) => {
    // Kiểm tra số điện thoại Việt Nam
    const phoneRegex = /^(0|\+84)\d{9,10}$/;
    return phoneRegex.test(phone);
};

/**
 * Kiểm tra các trường bắt buộc
 * @param {Object} data Dữ liệu cần kiểm tra
 * @param {Array<string>} requiredFields Các trường bắt buộc
 * @returns {Object} Kết quả kiểm tra {valid: boolean, missing: Array}
 */
const validateRequired = (data, requiredFields) => {
    const missing = [];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].toString().trim() === '') {
            missing.push(field);
        }
    }
    
    return {
        valid: missing.length === 0,
        missing
    };
};

/**
 * Validate trường số
 * @param {any} value Giá trị cần kiểm tra
 * @param {number} min Giá trị tối thiểu
 * @param {number} max Giá trị tối đa
 * @returns {boolean} Kết quả kiểm tra
 */
const isValidNumber = (value, min = null, max = null) => {
    const num = Number(value);
    
    if (isNaN(num)) {
        return false;
    }
    
    if (min !== null && num < min) {
        return false;
    }
    
    if (max !== null && num > max) {
        return false;
    }
    
    return true;
};

/**
 * Validate giá trị trong danh sách
 * @param {any} value Giá trị cần kiểm tra
 * @param {Array} allowedValues Danh sách giá trị cho phép
 * @returns {boolean} Kết quả kiểm tra
 */
const isValidEnum = (value, allowedValues) => {
    return allowedValues.includes(value);
};

/**
 * Tạo đối tượng lỗi validation
 * @param {string} field Tên trường
 * @param {string} message Thông báo lỗi
 * @returns {Object} Đối tượng lỗi
 */
const createValidationError = (field, message) => {
    return {
        field,
        message
    };
};

module.exports = {
    isValidEmail,
    isValidPhone,
    validateRequired,
    isValidNumber,
    isValidEnum,
    createValidationError
}; 