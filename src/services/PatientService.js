/**
 * Patient Service
 * Xử lý logic nghiệp vụ liên quan đến bệnh nhân
 */
const patientRepository = require('../models/PatientRepository');
const { validateRequired, isValidPhone, isValidNumber, isValidEnum } = require('../utils/validators');

class PatientService {
    /**
     * Lấy danh sách bệnh nhân với phân trang
     * @param {Object} options Tùy chọn phân trang và sắp xếp
     * @returns {Promise<Object>} Danh sách bệnh nhân và thông tin phân trang
     */
    async getPatients(options = {}) {
        const { page = 1, limit = 10, name, sortBy = 'id', order = 'ASC' } = options;
        const offset = (page - 1) * limit;
        
        const queryOptions = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            orderBy: sortBy,
            order: order.toUpperCase()
        };
        
        // Nếu có tìm kiếm theo tên
        if (name) {
            const patients = await patientRepository.findByName(name, queryOptions.limit);
            return { data: patients };
        }
        
        // Lấy danh sách bệnh nhân với phân trang
        const patients = await patientRepository.findAll(queryOptions);
        const total = await patientRepository.count();
        
        return {
            data: patients,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };
    }
    
    /**
     * Lấy thông tin bệnh nhân theo ID
     * @param {number} id ID của bệnh nhân
     * @returns {Promise<Object>} Thông tin bệnh nhân
     * @throws {Error} Nếu không tìm thấy bệnh nhân
     */
    async getPatientById(id) {
        const patient = await patientRepository.findById(id);
        
        if (!patient) {
            const error = new Error('Không tìm thấy bệnh nhân');
            error.statusCode = 404;
            throw error;
        }
        
        return patient;
    }
    
    /**
     * Tạo bệnh nhân mới
     * @param {Object} patientData Thông tin bệnh nhân
     * @returns {Promise<Object>} Bệnh nhân vừa tạo
     * @throws {Error} Nếu dữ liệu không hợp lệ
     */
    async createPatient(patientData) {
        const { full_name, gender, birth_year, phone, address } = patientData;
        
        // Validate dữ liệu
        const validationErrors = this.validatePatientData(patientData);
        
        if (validationErrors.length > 0) {
            const error = new Error('Dữ liệu bệnh nhân không hợp lệ');
            error.statusCode = 422;
            error.validationErrors = validationErrors;
            throw error;
        }
        
        // Tạo bệnh nhân mới
        return await patientRepository.create({
            full_name,
            gender,
            birth_year,
            phone,
            address
        });
    }
    
    /**
     * Cập nhật thông tin bệnh nhân
     * @param {number} id ID của bệnh nhân
     * @param {Object} patientData Thông tin cập nhật
     * @returns {Promise<Object>} Bệnh nhân sau khi cập nhật
     * @throws {Error} Nếu không tìm thấy bệnh nhân hoặc dữ liệu không hợp lệ
     */
    async updatePatient(id, patientData) {
        // Kiểm tra bệnh nhân tồn tại
        const patient = await patientRepository.findById(id);
        
        if (!patient) {
            const error = new Error('Không tìm thấy bệnh nhân');
            error.statusCode = 404;
            throw error;
        }
        
        // Validate dữ liệu
        const validationErrors = this.validatePatientData(patientData, false);
        
        if (validationErrors.length > 0) {
            const error = new Error('Dữ liệu bệnh nhân không hợp lệ');
            error.statusCode = 422;
            error.validationErrors = validationErrors;
            throw error;
        }
        
        // Cập nhật thông tin
        return await patientRepository.update(id, patientData);
    }
    
    /**
     * Xóa bệnh nhân
     * @param {number} id ID của bệnh nhân
     * @returns {Promise<boolean>} Kết quả xóa
     * @throws {Error} Nếu không tìm thấy bệnh nhân
     */
    async deletePatient(id) {
        // Kiểm tra bệnh nhân tồn tại
        const patient = await patientRepository.findById(id);
        
        if (!patient) {
            const error = new Error('Không tìm thấy bệnh nhân');
            error.statusCode = 404;
            throw error;
        }
        
        // Xóa bệnh nhân
        return await patientRepository.delete(id);
    }
    
    /**
     * Lấy lịch sử khám bệnh của bệnh nhân
     * @param {number} id ID của bệnh nhân
     * @returns {Promise<Array>} Lịch sử khám bệnh
     * @throws {Error} Nếu không tìm thấy bệnh nhân
     */
    async getPatientMedicalHistory(id) {
        // Kiểm tra bệnh nhân tồn tại
        const patient = await patientRepository.findById(id);
        
        if (!patient) {
            const error = new Error('Không tìm thấy bệnh nhân');
            error.statusCode = 404;
            throw error;
        }
        
        // Lấy lịch sử khám bệnh
        return await patientRepository.getMedicalHistory(id);
    }
    
    /**
     * Lấy danh sách lịch hẹn của bệnh nhân
     * @param {number} id ID của bệnh nhân
     * @returns {Promise<Array>} Danh sách lịch hẹn
     * @throws {Error} Nếu không tìm thấy bệnh nhân
     */
    async getPatientAppointments(id) {
        // Kiểm tra bệnh nhân tồn tại
        const patient = await patientRepository.findById(id);
        
        if (!patient) {
            const error = new Error('Không tìm thấy bệnh nhân');
            error.statusCode = 404;
            throw error;
        }
        
        // Lấy danh sách lịch hẹn
        return await patientRepository.getAppointments(id);
    }
    
    /**
     * Validate dữ liệu bệnh nhân
     * @param {Object} data Dữ liệu cần validate
     * @param {boolean} isRequired Có bắt buộc hay không
     * @returns {Array} Danh sách lỗi validation
     */
    validatePatientData(data, isRequired = true) {
        const { full_name, gender, birth_year, phone } = data;
        const validationErrors = [];
        
        // Kiểm tra các trường bắt buộc
        if (isRequired) {
            const requiredCheck = validateRequired(
                { full_name, gender, birth_year },
                ['full_name', 'gender', 'birth_year']
            );
            
            if (!requiredCheck.valid) {
                requiredCheck.missing.forEach(field => {
                    validationErrors.push({
                        field,
                        message: `Trường ${field} là bắt buộc`
                    });
                });
            }
        } else {
            // Trường hợp cập nhật, nếu có tên thì tên không được rỗng
            if (full_name !== undefined && !full_name.trim()) {
                validationErrors.push({
                    field: 'full_name',
                    message: 'Tên bệnh nhân không được để trống'
                });
            }
        }
        
        // Validate gender
        if (gender !== undefined && !isValidEnum(gender, ['Nam', 'Nu', 'Khac'])) {
            validationErrors.push({
                field: 'gender',
                message: 'Giới tính không hợp lệ'
            });
        }
        
        // Validate birth_year
        if (birth_year !== undefined && !isValidNumber(birth_year, 1900, new Date().getFullYear())) {
            validationErrors.push({
                field: 'birth_year',
                message: 'Năm sinh không hợp lệ'
            });
        }
        
        // Validate phone if provided
        if (phone !== undefined && phone && !isValidPhone(phone)) {
            validationErrors.push({
                field: 'phone',
                message: 'Số điện thoại không hợp lệ'
            });
        }
        
        return validationErrors;
    }
}

module.exports = new PatientService(); 