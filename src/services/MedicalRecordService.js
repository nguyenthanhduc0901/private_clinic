/**
 * Medical Record Service
 * Xử lý logic nghiệp vụ liên quan đến bệnh án
 */
const BaseService = require('./BaseService');
const medicalRecordRepository = require('../models/MedicalRecordRepository');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');
const { 
  validateCreateMedicalRecord, 
  validateUpdateMedicalRecord, 
  validateSearchMedicalRecord,
  validateCreatePrescription,
  validateUpdatePrescription,
  validateCreateInvoice 
} = require('../validators/medicalRecordValidators');

class MedicalRecordService extends BaseService {
  constructor() {
    super(medicalRecordRepository);
  }

  /**
   * Lấy chi tiết bệnh án với thông tin liên quan
   * @param {number} id ID của bệnh án
   * @returns {Promise<Object>} Chi tiết bệnh án
   * @throws {ApiError} Lỗi khi không tìm thấy bệnh án
   */
  async getDetailById(id) {
    const medicalRecord = await this.repository.getDetailById(id);
    
    if (!medicalRecord) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Không tìm thấy bệnh án',
        []
      );
    }
    
    return medicalRecord;
  }

  /**
   * Tạo bệnh án mới
   * @param {Object} data Dữ liệu bệnh án
   * @returns {Promise<Object>} Bệnh án vừa tạo
   * @throws {ApiError} Lỗi khi dữ liệu không hợp lệ
   */
  async createMedicalRecord(data) {
    // Validate dữ liệu
    const validationErrors = validateCreateMedicalRecord(data);
    
    if (validationErrors.length > 0) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Dữ liệu bệnh án không hợp lệ',
        validationErrors
      );
    }
    
    // Tạo bệnh án mới
    return await this.repository.create(data);
  }

  /**
   * Cập nhật bệnh án
   * @param {number} id ID của bệnh án
   * @param {Object} data Dữ liệu cập nhật
   * @returns {Promise<Object>} Bệnh án sau khi cập nhật
   * @throws {ApiError} Lỗi khi không tìm thấy bệnh án hoặc dữ liệu không hợp lệ
   */
  async updateMedicalRecord(id, data) {
    // Kiểm tra bệnh án tồn tại
    await this.getDetailById(id);
    
    // Validate dữ liệu
    const validationErrors = validateUpdateMedicalRecord(data);
    
    if (validationErrors.length > 0) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Dữ liệu bệnh án không hợp lệ',
        validationErrors
      );
    }
    
    // Cập nhật bệnh án
    return await this.repository.update(id, data);
  }

  /**
   * Xóa bệnh án
   * @param {number} id ID của bệnh án
   * @returns {Promise<boolean>} Kết quả xóa bệnh án
   * @throws {ApiError} Lỗi khi không tìm thấy bệnh án
   */
  async deleteMedicalRecord(id) {
    // Kiểm tra bệnh án tồn tại
    await this.getDetailById(id);
    
    // Xóa bệnh án
    return await this.repository.delete(id);
  }

  /**
   * Lấy đơn thuốc của bệnh án
   * @param {number} id ID của bệnh án
   * @returns {Promise<Array>} Danh sách đơn thuốc
   * @throws {ApiError} Lỗi khi không tìm thấy bệnh án
   */
  async getPrescriptions(id) {
    // Kiểm tra bệnh án tồn tại
    await this.getDetailById(id);
    
    // Lấy đơn thuốc
    return await this.repository.getPrescriptions(id);
  }

  /**
   * Thêm đơn thuốc cho bệnh án
   * @param {number} id ID của bệnh án
   * @param {Object} data Dữ liệu đơn thuốc
   * @returns {Promise<Object>} Đơn thuốc vừa tạo
   * @throws {ApiError} Lỗi khi không tìm thấy bệnh án hoặc dữ liệu không hợp lệ
   */
  async addPrescription(id, data) {
    // Kiểm tra bệnh án tồn tại
    await this.getDetailById(id);
    
    // Validate dữ liệu
    const validationErrors = validateCreatePrescription(data);
    
    if (validationErrors.length > 0) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Dữ liệu đơn thuốc không hợp lệ',
        validationErrors
      );
    }
    
    // TODO: Implement logic to add prescription
    // This is a placeholder and should be replaced with actual implementation
    return { id: 1, medical_record_id: id, ...data };
  }

  /**
   * Cập nhật đơn thuốc
   * @param {number} id ID của bệnh án
   * @param {number} prescriptionId ID của đơn thuốc
   * @param {Object} data Dữ liệu cập nhật
   * @returns {Promise<Object>} Đơn thuốc sau khi cập nhật
   * @throws {ApiError} Lỗi khi không tìm thấy bệnh án hoặc đơn thuốc, hoặc dữ liệu không hợp lệ
   */
  async updatePrescription(id, prescriptionId, data) {
    // Kiểm tra bệnh án tồn tại
    await this.getDetailById(id);
    
    // Validate dữ liệu
    const validationErrors = validateUpdatePrescription(data);
    
    if (validationErrors.length > 0) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Dữ liệu đơn thuốc không hợp lệ',
        validationErrors
      );
    }
    
    // TODO: Implement logic to update prescription
    // This is a placeholder and should be replaced with actual implementation
    return { id: prescriptionId, medical_record_id: id, ...data };
  }

  /**
   * Xóa đơn thuốc
   * @param {number} id ID của bệnh án
   * @param {number} prescriptionId ID của đơn thuốc
   * @returns {Promise<boolean>} Kết quả xóa đơn thuốc
   * @throws {ApiError} Lỗi khi không tìm thấy bệnh án hoặc đơn thuốc
   */
  async deletePrescription(id, prescriptionId) {
    // Kiểm tra bệnh án tồn tại
    await this.getDetailById(id);
    
    // TODO: Implement logic to delete prescription
    // This is a placeholder and should be replaced with actual implementation
    return true;
  }

  /**
   * Lấy hóa đơn của bệnh án
   * @param {number} id ID của bệnh án
   * @returns {Promise<Object>} Hóa đơn
   * @throws {ApiError} Lỗi khi không tìm thấy bệnh án
   */
  async getInvoice(id) {
    // Kiểm tra bệnh án tồn tại
    await this.getDetailById(id);
    
    // Lấy hóa đơn
    const invoice = await this.repository.getInvoice(id);
    
    if (!invoice) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Bệnh án chưa có hóa đơn',
        []
      );
    }
    
    return invoice;
  }

  /**
   * Tạo hóa đơn cho bệnh án
   * @param {number} id ID của bệnh án
   * @param {Object} data Dữ liệu hóa đơn
   * @returns {Promise<Object>} Hóa đơn vừa tạo
   * @throws {ApiError} Lỗi khi không tìm thấy bệnh án hoặc dữ liệu không hợp lệ
   */
  async createInvoice(id, data) {
    // Kiểm tra bệnh án tồn tại
    await this.getDetailById(id);
    
    // Kiểm tra bệnh án đã có hóa đơn chưa
    const existingInvoice = await this.repository.getInvoice(id);
    if (existingInvoice) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Bệnh án đã có hóa đơn',
        []
      );
    }
    
    // Validate dữ liệu
    const validationErrors = validateCreateInvoice(data);
    
    if (validationErrors.length > 0) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Dữ liệu hóa đơn không hợp lệ',
        validationErrors
      );
    }
    
    // TODO: Implement logic to create invoice
    // This is a placeholder and should be replaced with actual implementation
    return { id: 1, medical_record_id: id, ...data };
  }

  /**
   * Tìm kiếm bệnh án
   * @param {Object} criteria Tiêu chí tìm kiếm
   * @param {Object} options Tùy chọn phân trang
   * @returns {Promise<Object>} Kết quả tìm kiếm với phân trang
   * @throws {ApiError} Lỗi khi tiêu chí tìm kiếm không hợp lệ
   */
  async searchMedicalRecords(criteria, options = {}) {
    // Validate tiêu chí tìm kiếm
    const validationErrors = validateSearchMedicalRecord(criteria);
    
    if (validationErrors.length > 0) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Tiêu chí tìm kiếm không hợp lệ',
        validationErrors
      );
    }
    
    // Xử lý phân trang
    const { page = 1, limit = 10 } = options;
    
    // Tìm kiếm bệnh án
    const searchCriteria = {
      ...criteria,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
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