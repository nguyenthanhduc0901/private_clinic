/**
 * Medical Records Routes
 * Quản lý các route liên quan đến bệnh án
 */
const express = require('express');
const router = express.Router();
const { verifyToken, checkPermission } = require('../middleware/auth');
const { validateParams, validateBody, validateQuery, validateIdParam } = require('../middleware/validation');
const medicalRecordService = require('../services/MedicalRecordService');
const responseHandler = require('../utils/responseHandler');
const { validateCreateMedicalRecord, validateUpdateMedicalRecord, validateSearchMedicalRecord } = require('../validators/medicalRecordValidators');

// Áp dụng middleware xác thực cho tất cả routes
router.use(verifyToken);

/**
 * @route GET /api/medical-records
 * @desc Lấy danh sách bệnh án với phân trang và tìm kiếm
 */
router.get('/', 
    checkPermission('view_medical_record'), 
    validateQuery(validateSearchMedicalRecord),
    async (req, res, next) => {
        try {
            const result = await medicalRecordService.searchMedicalRecords(req.query);
            
            return responseHandler.successWithPagination(
                res, 
                result.data, 
                result.pagination, 
                'Lấy danh sách bệnh án thành công'
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /api/medical-records/:id
 * @desc Lấy chi tiết bệnh án
 */
router.get('/:id', 
    checkPermission('view_medical_record'), 
    validateParams(validateIdParam),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const medicalRecord = await medicalRecordService.getMedicalRecordDetail(id);
            
            return responseHandler.success(
                res, 
                medicalRecord, 
                'Lấy chi tiết bệnh án thành công'
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /api/medical-records
 * @desc Tạo bệnh án mới
 */
router.post('/', 
    checkPermission('create_medical_record'), 
    validateBody(validateCreateMedicalRecord),
    async (req, res, next) => {
        try {
            const newMedicalRecord = await medicalRecordService.createMedicalRecord({
                ...req.body,
                staff_id: req.user.id // Thêm ID của nhân viên đang đăng nhập
            });
            
            return responseHandler.success(
                res, 
                newMedicalRecord, 
                'Tạo bệnh án thành công', 
                201
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PUT /api/medical-records/:id
 * @desc Cập nhật bệnh án
 */
router.put('/:id', 
    checkPermission('update_medical_record'), 
    validateParams(validateIdParam),
    validateBody(validateUpdateMedicalRecord),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const updatedMedicalRecord = await medicalRecordService.updateMedicalRecord(id, req.body);
            
            return responseHandler.success(
                res, 
                updatedMedicalRecord, 
                'Cập nhật bệnh án thành công'
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route DELETE /api/medical-records/:id
 * @desc Xóa bệnh án
 */
router.delete('/:id', 
    checkPermission('delete_medical_record'), 
    validateParams(validateIdParam),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            await medicalRecordService.delete(id);
            
            return responseHandler.success(
                res, 
                null, 
                'Xóa bệnh án thành công'
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /api/medical-records/:id/prescriptions
 * @desc Lấy đơn thuốc của bệnh án
 */
router.get('/:id/prescriptions', 
    checkPermission('view_medical_record'), 
    validateParams(validateIdParam),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const prescriptions = await medicalRecordService.getMedicalRecordPrescriptions(id);
            
            return responseHandler.success(
                res, 
                prescriptions, 
                'Lấy đơn thuốc thành công'
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /api/medical-records/:id/invoice
 * @desc Lấy hóa đơn của bệnh án
 */
router.get('/:id/invoice', 
    checkPermission('view_invoice'), 
    validateParams(validateIdParam),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const invoice = await medicalRecordService.getMedicalRecordInvoice(id);
            
            if (!invoice) {
                return responseHandler.success(
                    res, 
                    null, 
                    'Bệnh án chưa có hóa đơn'
                );
            }
            
            return responseHandler.success(
                res, 
                invoice, 
                'Lấy hóa đơn thành công'
            );
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router; 