/**
 * Controller xử lý các chức năng liên quan đến hồ sơ bệnh án
 */
const { StatusCodes } = require('http-status-codes');
const MedicalRecordService = require('../services/MedicalRecordService');
const ApiError = require('../utils/ApiError');
const responseHandler = require('../utils/responseHandler');

/**
 * Lấy danh sách hồ sơ bệnh án với các tiêu chí tìm kiếm
 */
const getMedicalRecords = async (req, res, next) => {
  try {
    const { 
      patientId, staffId, diseaseTypeId, 
      startDate, endDate, keyword,
      page = 1, limit = 10 
    } = req.query;

    const criteria = {
      patientId,
      staffId,
      diseaseTypeId,
      startDate,
      endDate,
      keyword
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await MedicalRecordService.searchMedicalRecords(criteria, options);
    return responseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết của một hồ sơ bệnh án theo ID
 */
const getMedicalRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const medicalRecord = await MedicalRecordService.getDetailById(id);
    
    if (!medicalRecord) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy hồ sơ bệnh án');
    }
    
    return responseHandler.success(res, medicalRecord);
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo mới hồ sơ bệnh án
 */
const createMedicalRecord = async (req, res, next) => {
  try {
    const medicalRecord = await MedicalRecordService.createMedicalRecord(req.body);
    return responseHandler.created(res, medicalRecord, 'Tạo hồ sơ bệnh án thành công');
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật thông tin hồ sơ bệnh án
 */
const updateMedicalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRecord = await MedicalRecordService.updateMedicalRecord(id, req.body);
    
    if (!updatedRecord) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy hồ sơ bệnh án');
    }
    
    return responseHandler.success(
      res, 
      updatedRecord, 
      'Cập nhật hồ sơ bệnh án thành công'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa hồ sơ bệnh án
 */
const deleteMedicalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await MedicalRecordService.deleteMedicalRecord(id);
    
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy hồ sơ bệnh án');
    }
    
    return responseHandler.success(
      res, 
      null, 
      'Xóa hồ sơ bệnh án thành công'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách đơn thuốc của một hồ sơ bệnh án
 */
const getPrescriptions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prescriptions = await MedicalRecordService.getPrescriptions(id);
    
    return responseHandler.success(res, prescriptions);
  } catch (error) {
    next(error);
  }
};

/**
 * Thêm đơn thuốc cho hồ sơ bệnh án
 */
const addPrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prescription = await MedicalRecordService.addPrescription(id, req.body);
    
    return responseHandler.created(
      res, 
      prescription, 
      'Thêm đơn thuốc thành công'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật đơn thuốc
 */
const updatePrescription = async (req, res, next) => {
  try {
    const { id, prescriptionId } = req.params;
    const updatedPrescription = await MedicalRecordService.updatePrescription(
      id, 
      prescriptionId, 
      req.body
    );
    
    if (!updatedPrescription) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn thuốc');
    }
    
    return responseHandler.success(
      res, 
      updatedPrescription, 
      'Cập nhật đơn thuốc thành công'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa đơn thuốc
 */
const deletePrescription = async (req, res, next) => {
  try {
    const { id, prescriptionId } = req.params;
    const result = await MedicalRecordService.deletePrescription(id, prescriptionId);
    
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn thuốc');
    }
    
    return responseHandler.success(
      res, 
      null, 
      'Xóa đơn thuốc thành công'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy hóa đơn của hồ sơ bệnh án
 */
const getInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await MedicalRecordService.getInvoice(id);
    
    if (!invoice) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy hóa đơn');
    }
    
    return responseHandler.success(res, invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo hóa đơn cho hồ sơ bệnh án
 */
const createInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await MedicalRecordService.createInvoice(id, req.body);
    
    return responseHandler.created(
      res, 
      invoice, 
      'Tạo hóa đơn thành công'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getPrescriptions,
  addPrescription,
  updatePrescription,
  deletePrescription,
  getInvoice,
  createInvoice
}; 