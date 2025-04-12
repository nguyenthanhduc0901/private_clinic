/**
 * Medical Record Service
 * Xử lý logic nghiệp vụ liên quan đến bệnh án
 */
const BaseService = require('./BaseService');
const medicalRecordRepository = require('../models/MedicalRecordRepository');
const { validateCreateMedicalRecord, validateUpdateMedicalRecord, validateSearchMedicalRecord } = require('../validators/medicalRecordValidators');

class MedicalRecordService extends BaseService {
    constructor() {
        super(medicalRecordRepository);
    }

    /**
     * Lấy chi tiết bệnh án với thông tin liên quan
     * @param {number} id ID của bệnh án
     * @returns {Promise<Object>} Chi tiết bệnh án
     * @throws {Error} Lỗi khi không tìm thấy bệnh án
     */
    async getMedicalRecordDetail(id) {
        const medicalRecord = await this.repository.getDetailById(id);
        
        if (!medicalRecord) {
            const error = new Error('Không tìm thấy bệnh án');
            error.statusCode = 404;
            throw error;
        }
        
        return medicalRecord;
    }

    /**
     * Tạo bệnh án mới
     * @param {Object} data Dữ liệu bệnh án
     * @returns {Promise<Object>} Bệnh án vừa tạo
     * @throws {Error} Lỗi khi dữ liệu không hợp lệ
     */
    async createMedicalRecord(data) {
        // Validate dữ liệu
        const validationErrors = validateCreateMedicalRecord(data);
        
        if (validationErrors.length > 0) {
            const error = new Error('Dữ liệu bệnh án không hợp lệ');
            error.statusCode = 422;
            error.validationErrors = validationErrors;
            throw error;
        }
        
        // Tạo bệnh án mới
        return await this.repository.create(data);
    }

    /**
     * Cập nhật bệnh án
     * @param {number} id ID của bệnh án
     * @param {Object} data Dữ liệu cập nhật
     * @returns {Promise<Object>} Bệnh án sau khi cập nhật
     * @throws {Error} Lỗi khi không tìm thấy bệnh án hoặc dữ liệu không hợp lệ
     */
    async updateMedicalRecord(id, data) {
        // Kiểm tra bệnh án tồn tại
        await this.getById(id);
        
        // Validate dữ liệu
        const validationErrors = validateUpdateMedicalRecord(data);
        
        if (validationErrors.length > 0) {
            const error = new Error('Dữ liệu bệnh án không hợp lệ');
            error.statusCode = 422;
            error.validationErrors = validationErrors;
            throw error;
        }
        
        // Cập nhật bệnh án
        return await this.repository.update(id, data);
    }

    /**
     * Lấy đơn thuốc của bệnh án
     * @param {number} id ID của bệnh án
     * @returns {Promise<Array>} Danh sách đơn thuốc
     * @throws {Error} Lỗi khi không tìm thấy bệnh án
     */
    async getMedicalRecordPrescriptions(id) {
        // Kiểm tra bệnh án tồn tại
        await this.getById(id);
        
        // Lấy đơn thuốc
        return await this.repository.getPrescriptions(id);
    }

    /**
     * Lấy hóa đơn của bệnh án
     * @param {number} id ID của bệnh án
     * @returns {Promise<Object>} Hóa đơn
     * @throws {Error} Lỗi khi không tìm thấy bệnh án
     */
    async getMedicalRecordInvoice(id) {
        // Kiểm tra bệnh án tồn tại
        await this.getById(id);
        
        // Lấy hóa đơn
        const invoice = await this.repository.getInvoice(id);
        
        if (!invoice) {
            return null; // Có thể chưa có hóa đơn
        }
        
        return invoice;
    }

    /**
     * Tìm kiếm bệnh án
     * @param {Object} criteria Tiêu chí tìm kiếm
     * @returns {Promise<Object>} Kết quả tìm kiếm với phân trang
     * @throws {Error} Lỗi khi tiêu chí tìm kiếm không hợp lệ
     */
    async searchMedicalRecords(criteria) {
        // Validate tiêu chí tìm kiếm
        const validationErrors = validateSearchMedicalRecord(criteria);
        
        if (validationErrors.length > 0) {
            const error = new Error('Tiêu chí tìm kiếm không hợp lệ');
            error.statusCode = 422;
            error.validationErrors = validationErrors;
            throw error;
        }
        
        // Xử lý phân trang
        const { page = 1, limit = 10 } = criteria;
        const offset = (page - 1) * limit;
        
        // Tìm kiếm bệnh án
        const searchCriteria = {
            ...criteria,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };
        
        const medicalRecords = await this.repository.search(searchCriteria);
        const total = await this.repository.countSearch(searchCriteria);
        
        return {
            data: medicalRecords,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };
    }
}

module.exports = new MedicalRecordService(); 