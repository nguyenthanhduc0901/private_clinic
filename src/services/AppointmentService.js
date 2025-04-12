/**
 * Appointment Service
 * Xử lý logic nghiệp vụ liên quan đến lịch hẹn
 */
const BaseService = require('./BaseService');
const appointmentRepository = require('../models/AppointmentRepository');
const { 
    validateCreateAppointment, 
    validateUpdateAppointment, 
    validateSearchAppointment, 
    validateUpdateStatus 
} = require('../validators/appointmentValidators');

class AppointmentService extends BaseService {
    constructor() {
        super(appointmentRepository);
    }

    /**
     * Lấy danh sách lịch hẹn theo ngày
     * @param {string} date Ngày cần lấy lịch hẹn
     * @returns {Promise<Array>} Danh sách lịch hẹn
     * @throws {Error} Lỗi khi ngày không hợp lệ
     */
    async getAppointmentsByDate(date) {
        // Validate date
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!date || !dateRegex.test(date)) {
            const error = new Error('Ngày không hợp lệ');
            error.statusCode = 400;
            throw error;
        }
        
        return await this.repository.getByDate(date);
    }

    /**
     * Tạo lịch hẹn mới
     * @param {Object} data Dữ liệu lịch hẹn
     * @returns {Promise<Object>} Lịch hẹn vừa tạo
     * @throws {Error} Lỗi khi dữ liệu không hợp lệ
     */
    async createAppointment(data) {
        // Validate dữ liệu
        const validationErrors = validateCreateAppointment(data);
        
        if (validationErrors.length > 0) {
            const error = new Error('Dữ liệu lịch hẹn không hợp lệ');
            error.statusCode = 422;
            error.validationErrors = validationErrors;
            throw error;
        }
        
        // Lấy số thứ tự tiếp theo
        const orderNumber = await this.repository.getNextOrderNumber(data.appointment_date);
        
        // Mặc định trạng thái là waiting nếu không có
        const appointmentData = {
            ...data,
            order_number: orderNumber,
            status: data.status || 'waiting'
        };
        
        // Tạo lịch hẹn mới
        return await this.repository.create(appointmentData);
    }

    /**
     * Cập nhật lịch hẹn
     * @param {number} id ID của lịch hẹn
     * @param {Object} data Dữ liệu cập nhật
     * @returns {Promise<Object>} Lịch hẹn sau khi cập nhật
     * @throws {Error} Lỗi khi không tìm thấy lịch hẹn hoặc dữ liệu không hợp lệ
     */
    async updateAppointment(id, data) {
        // Kiểm tra lịch hẹn tồn tại
        await this.getById(id);
        
        // Validate dữ liệu
        const validationErrors = validateUpdateAppointment(data);
        
        if (validationErrors.length > 0) {
            const error = new Error('Dữ liệu lịch hẹn không hợp lệ');
            error.statusCode = 422;
            error.validationErrors = validationErrors;
            throw error;
        }
        
        // Cập nhật lịch hẹn
        return await this.repository.update(id, data);
    }

    /**
     * Cập nhật trạng thái lịch hẹn
     * @param {number} id ID của lịch hẹn
     * @param {string} status Trạng thái mới
     * @returns {Promise<Object>} Lịch hẹn sau khi cập nhật
     * @throws {Error} Lỗi khi không tìm thấy lịch hẹn hoặc trạng thái không hợp lệ
     */
    async updateAppointmentStatus(id, status) {
        // Kiểm tra lịch hẹn tồn tại
        await this.getById(id);
        
        // Validate trạng thái
        const validationErrors = validateUpdateStatus({ status });
        
        if (validationErrors.length > 0) {
            const error = new Error('Trạng thái không hợp lệ');
            error.statusCode = 422;
            error.validationErrors = validationErrors;
            throw error;
        }
        
        // Cập nhật trạng thái
        return await this.repository.updateStatus(id, status);
    }

    /**
     * Tìm kiếm lịch hẹn theo nhiều tiêu chí
     * @param {Object} criteria Tiêu chí tìm kiếm (patient_id, status, start_date, end_date, keyword)
     * @param {Object} options Tùy chọn phân trang (page, limit)
     * @returns {Promise<Object>} Kết quả tìm kiếm với phân trang
     */
    async searchAppointments(criteria, options = {}) {
        try {
            // Kiểm tra và chuẩn bị dữ liệu
            const searchCriteria = this._prepareSearchCriteria(criteria);
            const { page = 1, limit = 10 } = options;
            
            // Tính offset cho phân trang
            const offset = (page - 1) * limit;
            
            // Thực hiện tìm kiếm
            const appointments = await this.repository.search({
                ...searchCriteria,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            
            // Đếm tổng số kết quả
            const total = await this.repository.countSearch(searchCriteria);
            
            return {
                data: appointments,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            throw this._handleError(error, 'Lỗi khi tìm kiếm lịch hẹn');
        }
    }

    /**
     * Xóa lịch hẹn
     * @param {number} id ID của lịch hẹn
     * @returns {Promise<boolean>} Kết quả xóa lịch hẹn
     * @throws {Error} Lỗi nếu không tìm thấy lịch hẹn hoặc xóa thất bại
     */
    async deleteAppointment(id) {
        try {
            if (!id) {
                const error = new Error('ID lịch hẹn không được để trống');
                error.statusCode = 400;
                throw error;
            }

            // Gọi phương thức delete từ BaseService
            const result = await this.delete(id);
            
            return result;
        } catch (error) {
            throw this._handleError(error, 'Lỗi khi xóa lịch hẹn');
        }
    }

    // Helper methods
}

module.exports = new AppointmentService(); 