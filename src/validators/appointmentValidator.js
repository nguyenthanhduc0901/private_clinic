/**
 * Validators cho các route appointments
 */
const { body, query } = require('express-validator');

/**
 * Validate tìm kiếm appointment
 */
const validateSearchAppointment = [
  query('startDate').optional().isDate().withMessage('Ngày bắt đầu không hợp lệ'),
  query('endDate').optional().isDate().withMessage('Ngày kết thúc không hợp lệ'),
  query('status').optional().isString().withMessage('Trạng thái không hợp lệ'),
  query('patientId').optional().isMongoId().withMessage('ID bệnh nhân không hợp lệ'),
  query('doctorId').optional().isMongoId().withMessage('ID bác sĩ không hợp lệ'),
  query('page').optional().isInt({ min: 1 }).withMessage('Trang phải là số nguyên dương'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit phải là số nguyên dương')
];

/**
 * Validate tạo appointment mới
 */
const validateCreateAppointment = [
  body('patientId').isMongoId().withMessage('ID bệnh nhân không hợp lệ'),
  body('doctorId').isMongoId().withMessage('ID bác sĩ không hợp lệ'),
  body('date').isDate().withMessage('Ngày không hợp lệ'),
  body('timeSlot').isString().withMessage('Khung giờ không hợp lệ'),
  body('reason').isString().withMessage('Lý do không hợp lệ'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Trạng thái không hợp lệ'),
  body('notes').optional().isString().withMessage('Ghi chú không hợp lệ')
];

/**
 * Validate cập nhật appointment
 */
const validateUpdateAppointment = [
  body('patientId').optional().isMongoId().withMessage('ID bệnh nhân không hợp lệ'),
  body('doctorId').optional().isMongoId().withMessage('ID bác sĩ không hợp lệ'),
  body('date').optional().isDate().withMessage('Ngày không hợp lệ'),
  body('timeSlot').optional().isString().withMessage('Khung giờ không hợp lệ'),
  body('reason').optional().isString().withMessage('Lý do không hợp lệ'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Trạng thái không hợp lệ'),
  body('notes').optional().isString().withMessage('Ghi chú không hợp lệ')
];

/**
 * Validate cập nhật trạng thái appointment
 */
const validateUpdateStatus = [
  body('status')
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Trạng thái không hợp lệ'),
  body('notes').optional().isString().withMessage('Ghi chú không hợp lệ')
];

module.exports = {
  validateSearchAppointment,
  validateCreateAppointment,
  validateUpdateAppointment,
  validateUpdateStatus
}; 