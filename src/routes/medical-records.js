/**
 * Router xử lý các endpoints của hồ sơ bệnh án
 */
const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const validateMiddleware = require('../middleware/validation').validateBody;
const { 
  validateCreateMedicalRecord,
  validateUpdateMedicalRecord,
  validateSearchMedicalRecord,
  validateCreatePrescription,
  validateUpdatePrescription,
  validateCreateInvoice
} = require('../validators/medicalRecordValidators');
const asyncHandler = require('../middleware/asyncHandler');
const { verifyToken } = require('../middleware/auth');

// Đảm bảo tất cả các routes đều yêu cầu xác thực
router.use(verifyToken);

/**
 * @route   GET /api/medical-records
 * @desc    Lấy danh sách hồ sơ bệnh án, có thể lọc theo nhiều tiêu chí
 * @access  Private
 */
router.get('/', validateSearchMedicalRecord, validateMiddleware, asyncHandler(async (req, res, next) => {
  if (medicalRecordController && medicalRecordController.getMedicalRecords) {
    return medicalRecordController.getMedicalRecords(req, res, next);
  }
  res.json({
    success: true,
    message: 'Tính năng đang được phát triển'
  });
}));

/**
 * @route   GET /api/medical-records/:id
 * @desc    Lấy chi tiết của một hồ sơ bệnh án
 * @access  Private
 */
router.get('/:id', asyncHandler(async (req, res, next) => {
  if (medicalRecordController && medicalRecordController.getMedicalRecordById) {
    return medicalRecordController.getMedicalRecordById(req, res, next);
  }
  res.json({
    success: true,
    message: 'Tính năng đang được phát triển'
  });
}));

/**
 * @route   POST /api/medical-records
 * @desc    Tạo hồ sơ bệnh án mới
 * @access  Private
 */
router.post('/', validateCreateMedicalRecord, validateMiddleware, asyncHandler(async (req, res, next) => {
  if (medicalRecordController && medicalRecordController.createMedicalRecord) {
    return medicalRecordController.createMedicalRecord(req, res, next);
  }
  res.json({
    success: true,
    message: 'Tính năng đang được phát triển'
  });
}));

/**
 * @route   PUT /api/medical-records/:id
 * @desc    Cập nhật thông tin hồ sơ bệnh án
 * @access  Private
 */
router.put('/:id', validateUpdateMedicalRecord, validateMiddleware, asyncHandler(async (req, res, next) => {
  if (medicalRecordController && medicalRecordController.updateMedicalRecord) {
    return medicalRecordController.updateMedicalRecord(req, res, next);
  }
  res.json({
    success: true,
    message: 'Tính năng đang được phát triển'
  });
}));

/**
 * @route   DELETE /api/medical-records/:id
 * @desc    Xóa hồ sơ bệnh án
 * @access  Private (Yêu cầu quyền admin)
 */
router.delete('/:id', asyncHandler(async (req, res, next) => {
  if (medicalRecordController && medicalRecordController.deleteMedicalRecord) {
    return medicalRecordController.deleteMedicalRecord(req, res, next);
  }
  res.json({
    success: true,
    message: 'Tính năng đang được phát triển'
  });
}));

/**
 * @route   GET /api/medical-records/:id/prescriptions
 * @desc    Lấy danh sách đơn thuốc của một hồ sơ bệnh án
 * @access  Private
 */
router.get('/:id/prescriptions', asyncHandler(async (req, res, next) => {
  if (medicalRecordController && medicalRecordController.getPrescriptions) {
    return medicalRecordController.getPrescriptions(req, res, next);
  }
  res.json({
    success: true,
    message: 'Tính năng đang được phát triển'
  });
}));

/**
 * @route   POST /api/medical-records/:id/prescriptions
 * @desc    Thêm đơn thuốc cho hồ sơ bệnh án
 * @access  Private
 */
router.post(
  '/:id/prescriptions',
  validateCreatePrescription,
  validateMiddleware,
  asyncHandler(async (req, res, next) => {
    if (medicalRecordController && medicalRecordController.addPrescription) {
      return medicalRecordController.addPrescription(req, res, next);
    }
    res.json({
      success: true,
      message: 'Tính năng đang được phát triển'
    });
  })
);

/**
 * @route   PUT /api/medical-records/:id/prescriptions/:prescriptionId
 * @desc    Cập nhật đơn thuốc
 * @access  Private
 */
router.put(
  '/:id/prescriptions/:prescriptionId',
  validateUpdatePrescription,
  validateMiddleware,
  asyncHandler(async (req, res, next) => {
    if (medicalRecordController && medicalRecordController.updatePrescription) {
      return medicalRecordController.updatePrescription(req, res, next);
    }
    res.json({
      success: true,
      message: 'Tính năng đang được phát triển'
    });
  })
);

/**
 * @route   DELETE /api/medical-records/:id/prescriptions/:prescriptionId
 * @desc    Xóa đơn thuốc
 * @access  Private
 */
router.delete('/:id/prescriptions/:prescriptionId', asyncHandler(async (req, res, next) => {
  if (medicalRecordController && medicalRecordController.deletePrescription) {
    return medicalRecordController.deletePrescription(req, res, next);
  }
  res.json({
    success: true,
    message: 'Tính năng đang được phát triển'
  });
}));

/**
 * @route   GET /api/medical-records/:id/invoice
 * @desc    Lấy hóa đơn của hồ sơ bệnh án
 * @access  Private
 */
router.get('/:id/invoice', asyncHandler(async (req, res, next) => {
  if (medicalRecordController && medicalRecordController.getInvoice) {
    return medicalRecordController.getInvoice(req, res, next);
  }
  res.json({
    success: true,
    message: 'Tính năng đang được phát triển'
  });
}));

/**
 * @route   POST /api/medical-records/:id/invoice
 * @desc    Tạo hóa đơn cho hồ sơ bệnh án
 * @access  Private
 */
router.post(
  '/:id/invoice',
  validateCreateInvoice,
  validateMiddleware,
  asyncHandler(async (req, res, next) => {
    if (medicalRecordController && medicalRecordController.createInvoice) {
      return medicalRecordController.createInvoice(req, res, next);
    }
    res.json({
      success: true,
      message: 'Tính năng đang được phát triển'
    });
  })
);

module.exports = router; 