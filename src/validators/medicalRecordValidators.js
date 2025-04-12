/**
 * Medical Record Validators
 * Các hàm kiểm tra tính hợp lệ của dữ liệu bệnh án
 */
const { isValidNumber, validateRequired } = require('../utils/validators');

/**
 * Validate dữ liệu tạo mới bệnh án
 * @param {Object} data Dữ liệu bệnh án
 * @returns {Array} Danh sách lỗi
 */
const validateCreateMedicalRecord = (data) => {
    const { patient_id, staff_id, examination_date, disease_type_id } = data;
    const errors = [];
    
    // Kiểm tra các trường bắt buộc
    const requiredCheck = validateRequired(
        { patient_id, staff_id, examination_date },
        ['patient_id', 'staff_id', 'examination_date']
    );
    
    if (!requiredCheck.valid) {
        requiredCheck.missing.forEach(field => {
            errors.push({
                field,
                message: `Trường ${field} là bắt buộc`
            });
        });
    }
    
    // Kiểm tra ID
    if (patient_id && !isValidNumber(patient_id, 1)) {
        errors.push({
            field: 'patient_id',
            message: 'ID bệnh nhân không hợp lệ'
        });
    }
    
    if (staff_id && !isValidNumber(staff_id, 1)) {
        errors.push({
            field: 'staff_id',
            message: 'ID nhân viên không hợp lệ'
        });
    }
    
    if (disease_type_id && !isValidNumber(disease_type_id, 1)) {
        errors.push({
            field: 'disease_type_id',
            message: 'ID loại bệnh không hợp lệ'
        });
    }
    
    // Kiểm tra ngày khám
    if (examination_date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(examination_date)) {
            errors.push({
                field: 'examination_date',
                message: 'Ngày khám phải có định dạng YYYY-MM-DD'
            });
        } else {
            const date = new Date(examination_date);
            if (isNaN(date.getTime())) {
                errors.push({
                    field: 'examination_date',
                    message: 'Ngày khám không hợp lệ'
                });
            }
        }
    }
    
    return errors;
};

/**
 * Validate dữ liệu cập nhật bệnh án
 * @param {Object} data Dữ liệu bệnh án
 * @returns {Array} Danh sách lỗi
 */
const validateUpdateMedicalRecord = (data) => {
    const errors = [];
    const { patient_id, staff_id, examination_date, disease_type_id } = data;
    
    // Kiểm tra ID nếu có
    if (patient_id !== undefined && !isValidNumber(patient_id, 1)) {
        errors.push({
            field: 'patient_id',
            message: 'ID bệnh nhân không hợp lệ'
        });
    }
    
    if (staff_id !== undefined && !isValidNumber(staff_id, 1)) {
        errors.push({
            field: 'staff_id',
            message: 'ID nhân viên không hợp lệ'
        });
    }
    
    if (disease_type_id !== undefined && !isValidNumber(disease_type_id, 1)) {
        errors.push({
            field: 'disease_type_id',
            message: 'ID loại bệnh không hợp lệ'
        });
    }
    
    // Kiểm tra ngày khám nếu có
    if (examination_date !== undefined) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(examination_date)) {
            errors.push({
                field: 'examination_date',
                message: 'Ngày khám phải có định dạng YYYY-MM-DD'
            });
        } else {
            const date = new Date(examination_date);
            if (isNaN(date.getTime())) {
                errors.push({
                    field: 'examination_date',
                    message: 'Ngày khám không hợp lệ'
                });
            }
        }
    }
    
    return errors;
};

/**
 * Validate dữ liệu tìm kiếm bệnh án
 * @param {Object} criteria Tiêu chí tìm kiếm
 * @returns {Array} Danh sách lỗi
 */
const validateSearchMedicalRecord = (criteria) => {
    const errors = [];
    const { 
        patientId, 
        staffId, 
        diseaseTypeId, 
        startDate, 
        endDate,
        page,
        limit
    } = criteria;
    
    // Kiểm tra các ID
    if (patientId !== undefined && !isValidNumber(patientId, 1)) {
        errors.push({
            field: 'patientId',
            message: 'ID bệnh nhân không hợp lệ'
        });
    }
    
    if (staffId !== undefined && !isValidNumber(staffId, 1)) {
        errors.push({
            field: 'staffId',
            message: 'ID nhân viên không hợp lệ'
        });
    }
    
    if (diseaseTypeId !== undefined && !isValidNumber(diseaseTypeId, 1)) {
        errors.push({
            field: 'diseaseTypeId',
            message: 'ID loại bệnh không hợp lệ'
        });
    }
    
    // Kiểm tra ngày tháng
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (startDate !== undefined) {
        if (!dateRegex.test(startDate)) {
            errors.push({
                field: 'startDate',
                message: 'Ngày bắt đầu phải có định dạng YYYY-MM-DD'
            });
        } else {
            const date = new Date(startDate);
            if (isNaN(date.getTime())) {
                errors.push({
                    field: 'startDate',
                    message: 'Ngày bắt đầu không hợp lệ'
                });
            }
        }
    }
    
    if (endDate !== undefined) {
        if (!dateRegex.test(endDate)) {
            errors.push({
                field: 'endDate',
                message: 'Ngày kết thúc phải có định dạng YYYY-MM-DD'
            });
        } else {
            const date = new Date(endDate);
            if (isNaN(date.getTime())) {
                errors.push({
                    field: 'endDate',
                    message: 'Ngày kết thúc không hợp lệ'
                });
            }
        }
    }
    
    // Kiểm tra phân trang
    if (page !== undefined && !isValidNumber(page, 1)) {
        errors.push({
            field: 'page',
            message: 'Trang phải là số dương'
        });
    }
    
    if (limit !== undefined && !isValidNumber(limit, 1, 100)) {
        errors.push({
            field: 'limit',
            message: 'Giới hạn phải là số dương và không quá 100'
        });
    }
    
    return errors;
};

/**
 * Validate dữ liệu tạo đơn thuốc
 * @param {Object} data Dữ liệu đơn thuốc
 * @returns {Array} Danh sách lỗi
 */
const validateCreatePrescription = (data) => {
    const errors = [];
    const { medicine_id, usage_instruction_id, quantity, dosage } = data;
    
    // Kiểm tra các trường bắt buộc
    const requiredCheck = validateRequired(
        { medicine_id, usage_instruction_id, quantity },
        ['medicine_id', 'usage_instruction_id', 'quantity']
    );
    
    if (!requiredCheck.valid) {
        requiredCheck.missing.forEach(field => {
            errors.push({
                field,
                message: `Trường ${field} là bắt buộc`
            });
        });
    }
    
    // Kiểm tra ID
    if (medicine_id && !isValidNumber(medicine_id, 1)) {
        errors.push({
            field: 'medicine_id',
            message: 'ID thuốc không hợp lệ'
        });
    }
    
    if (usage_instruction_id && !isValidNumber(usage_instruction_id, 1)) {
        errors.push({
            field: 'usage_instruction_id',
            message: 'ID hướng dẫn sử dụng không hợp lệ'
        });
    }
    
    // Kiểm tra số lượng
    if (quantity !== undefined) {
        if (!isValidNumber(quantity, 1)) {
            errors.push({
                field: 'quantity',
                message: 'Số lượng phải là số dương'
            });
        }
    }
    
    return errors;
};

/**
 * Validate dữ liệu cập nhật đơn thuốc
 * @param {Object} data Dữ liệu đơn thuốc
 * @returns {Array} Danh sách lỗi
 */
const validateUpdatePrescription = (data) => {
    const errors = [];
    const { medicine_id, usage_instruction_id, quantity, dosage } = data;
    
    // Kiểm tra ID nếu có
    if (medicine_id !== undefined && !isValidNumber(medicine_id, 1)) {
        errors.push({
            field: 'medicine_id',
            message: 'ID thuốc không hợp lệ'
        });
    }
    
    if (usage_instruction_id !== undefined && !isValidNumber(usage_instruction_id, 1)) {
        errors.push({
            field: 'usage_instruction_id',
            message: 'ID hướng dẫn sử dụng không hợp lệ'
        });
    }
    
    // Kiểm tra số lượng nếu có
    if (quantity !== undefined && !isValidNumber(quantity, 1)) {
        errors.push({
            field: 'quantity',
            message: 'Số lượng phải là số dương'
        });
    }
    
    return errors;
};

/**
 * Validate dữ liệu tạo hóa đơn
 * @param {Object} data Dữ liệu hóa đơn
 * @returns {Array} Danh sách lỗi
 */
const validateCreateInvoice = (data) => {
    const errors = [];
    const { 
        examination_fee, 
        medicine_fee, 
        total_amount, 
        payment_method,
        payment_status
    } = data;
    
    // Kiểm tra các trường bắt buộc
    const requiredCheck = validateRequired(
        { examination_fee, total_amount, payment_method },
        ['examination_fee', 'total_amount', 'payment_method']
    );
    
    if (!requiredCheck.valid) {
        requiredCheck.missing.forEach(field => {
            errors.push({
                field,
                message: `Trường ${field} là bắt buộc`
            });
        });
    }
    
    // Kiểm tra số tiền
    if (examination_fee !== undefined && (!Number.isFinite(Number(examination_fee)) || Number(examination_fee) < 0)) {
        errors.push({
            field: 'examination_fee',
            message: 'Phí khám phải là số không âm'
        });
    }
    
    if (medicine_fee !== undefined && (!Number.isFinite(Number(medicine_fee)) || Number(medicine_fee) < 0)) {
        errors.push({
            field: 'medicine_fee',
            message: 'Phí thuốc phải là số không âm'
        });
    }
    
    if (total_amount !== undefined && (!Number.isFinite(Number(total_amount)) || Number(total_amount) < 0)) {
        errors.push({
            field: 'total_amount',
            message: 'Tổng tiền phải là số không âm'
        });
    }
    
    // Kiểm tra phương thức thanh toán
    if (payment_method !== undefined) {
        const validPaymentMethods = ['CASH', 'BANK_TRANSFER', 'CARD'];
        if (!validPaymentMethods.includes(payment_method)) {
            errors.push({
                field: 'payment_method',
                message: 'Phương thức thanh toán không hợp lệ'
            });
        }
    }
    
    // Kiểm tra trạng thái thanh toán
    if (payment_status !== undefined) {
        const validPaymentStatuses = ['PAID', 'PENDING', 'CANCELLED'];
        if (!validPaymentStatuses.includes(payment_status)) {
            errors.push({
                field: 'payment_status',
                message: 'Trạng thái thanh toán không hợp lệ'
            });
        }
    }
    
    return errors;
};

module.exports = {
    validateCreateMedicalRecord,
    validateUpdateMedicalRecord,
    validateSearchMedicalRecord,
    validateCreatePrescription,
    validateUpdatePrescription,
    validateCreateInvoice
}; 