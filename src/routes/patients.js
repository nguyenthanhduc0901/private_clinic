/**
 * Patients Routes
 * Quản lý các route liên quan đến bệnh nhân
 */
const express = require('express');
const router = express.Router();
const { verifyToken, checkPermission } = require('../middleware/auth');
const { validateParams, validateBody, validateIdParam } = require('../middleware/validation');
const patientService = require('../services/PatientService');
const responseHandler = require('../utils/responseHandler');

// Áp dụng middleware xác thực cho tất cả routes
router.use(verifyToken);

/**
 * @route GET /api/patients
 * @desc Lấy danh sách bệnh nhân
 */
router.get('/', checkPermission('view_patient'), async (req, res, next) => {
    try {
        const result = await patientService.getPatients(req.query);
        
        // Kiểm tra xem có phân trang hay không
        if (result.pagination) {
            return responseHandler.successWithPagination(
                res, 
                result.data, 
                result.pagination, 
                'Lấy danh sách bệnh nhân thành công'
            );
        }
        
        return responseHandler.success(
            res, 
            result.data, 
            'Lấy danh sách bệnh nhân thành công'
        );
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/patients/:id
 * @desc Lấy thông tin bệnh nhân theo ID
 */
router.get('/:id', 
    checkPermission('view_patient'), 
    validateParams(validateIdParam),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const patient = await patientService.getPatientById(id);
            return responseHandler.success(res, patient, 'Lấy thông tin bệnh nhân thành công');
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /api/patients
 * @desc Tạo bệnh nhân mới
 */
router.post('/', 
    checkPermission('create_patient'), 
    async (req, res, next) => {
        try {
            const newPatient = await patientService.createPatient(req.body);
            return responseHandler.success(
                res, 
                newPatient, 
                'Tạo bệnh nhân thành công', 
                201
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PUT /api/patients/:id
 * @desc Cập nhật thông tin bệnh nhân
 */
router.put('/:id', 
    checkPermission('update_patient'), 
    validateParams(validateIdParam),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const updatedPatient = await patientService.updatePatient(id, req.body);
            return responseHandler.success(
                res, 
                updatedPatient, 
                'Cập nhật bệnh nhân thành công'
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route DELETE /api/patients/:id
 * @desc Xóa bệnh nhân
 */
router.delete('/:id', 
    checkPermission('delete_patient'), 
    validateParams(validateIdParam),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            await patientService.deletePatient(id);
            return responseHandler.success(
                res, 
                null, 
                'Xóa bệnh nhân thành công'
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /api/patients/:id/medical-history
 * @desc Lấy lịch sử khám bệnh của bệnh nhân
 */
router.get('/:id/medical-history', 
    checkPermission('view_medical_record'), 
    validateParams(validateIdParam),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const medicalHistory = await patientService.getPatientMedicalHistory(id);
            return responseHandler.success(
                res, 
                medicalHistory, 
                'Lấy lịch sử khám bệnh thành công'
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /api/patients/:id/appointments
 * @desc Lấy danh sách lịch hẹn của bệnh nhân
 */
router.get('/:id/appointments', 
    checkPermission('view_appointment'), 
    validateParams(validateIdParam),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const appointments = await patientService.getPatientAppointments(id);
            return responseHandler.success(
                res, 
                appointments, 
                'Lấy danh sách lịch hẹn thành công'
            );
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router; 