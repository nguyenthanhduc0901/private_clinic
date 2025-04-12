/**
 * Router xử lý các endpoints của appointments
 */
const express = require('express');
const router = express.Router();
const AppointmentService = require('../services/AppointmentService');
const { 
  validateCreateAppointment, 
  validateUpdateAppointment, 
  validateUpdateStatus,
  validateSearchAppointment 
} = require('../validators/appointmentValidators');
const asyncHandler = require('../middlewares/asyncHandler');
const validateMiddleware = require('../middlewares/validateMiddleware');

/**
 * @route   GET /api/appointments
 * @desc    Lấy danh sách các lịch hẹn theo các tiêu chí tìm kiếm
 * @access  Private
 */
router.get('/', validateSearchAppointment, validateMiddleware, asyncHandler(async (req, res) => {
  const { 
    date, 
    patient_id, 
    status, 
    page = 1, 
    limit = 10 
  } = req.query;

  const result = await AppointmentService.searchAppointments({
    date,
    patient_id,
    status,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  });

  res.json({
    success: true,
    ...result
  });
}));

/**
 * @route   GET /api/appointments/date/:date
 * @desc    Lấy danh sách lịch hẹn trong một ngày cụ thể
 * @access  Private
 */
router.get('/date/:date', asyncHandler(async (req, res) => {
  const { date } = req.params;
  const appointments = await AppointmentService.getAppointmentsByDate(date);

  res.json({
    success: true,
    data: appointments
  });
}));

/**
 * @route   GET /api/appointments/:id
 * @desc    Lấy thông tin chi tiết một lịch hẹn theo ID
 * @access  Private
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appointment = await AppointmentService.getAppointmentById(id);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lịch hẹn'
    });
  }

  res.json({
    success: true,
    data: appointment
  });
}));

/**
 * @route   POST /api/appointments
 * @desc    Tạo lịch hẹn mới
 * @access  Private
 */
router.post('/', validateCreateAppointment, validateMiddleware, asyncHandler(async (req, res) => {
  const newAppointment = await AppointmentService.createAppointment(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Tạo lịch hẹn thành công',
    data: newAppointment
  });
}));

/**
 * @route   PUT /api/appointments/:id
 * @desc    Cập nhật thông tin lịch hẹn
 * @access  Private
 */
router.put('/:id', validateUpdateAppointment, validateMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedAppointment = await AppointmentService.updateAppointment(id, req.body);
  
  if (!updatedAppointment) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lịch hẹn'
    });
  }

  res.json({
    success: true,
    message: 'Cập nhật lịch hẹn thành công',
    data: updatedAppointment
  });
}));

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Cập nhật trạng thái lịch hẹn
 * @access  Private
 */
router.patch('/:id/status', validateUpdateStatus, validateMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const updatedAppointment = await AppointmentService.updateAppointmentStatus(id, status);
  
  if (!updatedAppointment) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lịch hẹn'
    });
  }

  res.json({
    success: true,
    message: 'Cập nhật trạng thái lịch hẹn thành công',
    data: updatedAppointment
  });
}));

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Xóa lịch hẹn
 * @access  Private
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await AppointmentService.deleteAppointment(id);
  
  if (!result) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lịch hẹn'
    });
  }

  res.json({
    success: true,
    message: 'Xóa lịch hẹn thành công'
  });
}));

module.exports = router; 