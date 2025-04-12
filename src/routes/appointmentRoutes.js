/**
 * Routes cho appointments
 */
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const validateMiddleware = require('../middleware/validateMiddleware');
const { 
  validateSearchAppointment,
  validateCreateAppointment, 
  validateUpdateAppointment,
  validateUpdateStatus
} = require('../validators/appointmentValidator');

// Lấy danh sách appointments, có thể lọc theo nhiều tiêu chí
router.get('/', validateSearchAppointment, validateMiddleware, appointmentController.getAppointments);

// Lấy chi tiết của một appointment
router.get('/:id', appointmentController.getAppointmentById);

// Tạo mới appointment
router.post('/', validateCreateAppointment, validateMiddleware, appointmentController.createAppointment);

// Cập nhật toàn bộ thông tin appointment
router.put('/:id', validateUpdateAppointment, validateMiddleware, appointmentController.updateAppointment);

// Cập nhật một phần thông tin appointment
router.patch('/:id', validateUpdateAppointment, validateMiddleware, appointmentController.updateAppointment);

// Cập nhật trạng thái appointment
router.patch('/:id/status', validateUpdateStatus, validateMiddleware, appointmentController.updateAppointmentStatus);

// Xóa appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router; 