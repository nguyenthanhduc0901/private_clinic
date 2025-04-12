/**
 * Appointment Validators
 * Các hàm kiểm tra tính hợp lệ của dữ liệu lịch hẹn
 */
const { isValidNumber, validateRequired, isValidEnum } = require('../utils/validators');
const { body, query } = require('express-validator');

/**
 * Validators cho Appointment
 */
const validStatuses = ['waiting', 'in_progress', 'completed', 'cancelled'];

/**
 * Validate dữ liệu tạo mới lịch hẹn
 * @param {Object} data Dữ liệu lịch hẹn
 * @returns {Array} Danh sách lỗi
 */
const validateCreateAppointment = [
  body('patient_id')
    .notEmpty().withMessage('ID bệnh nhân không được để trống')
    .isMongoId().withMessage('ID bệnh nhân không hợp lệ'),
  
  body('appointment_date')
    .notEmpty().withMessage('Ngày hẹn không được để trống')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Ngày hẹn phải có định dạng YYYY-MM-DD'),
  
  body('appointment_time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Thời gian hẹn phải có định dạng HH:MM'),
  
  body('reason')
    .optional()
    .isString().withMessage('Lý do khám phải là chuỗi')
    .isLength({ max: 500 }).withMessage('Lý do khám không được vượt quá 500 ký tự'),
  
  body('notes')
    .optional()
    .isString().withMessage('Ghi chú phải là chuỗi')
    .isLength({ max: 1000 }).withMessage('Ghi chú không được vượt quá 1000 ký tự'),
];

/**
 * Validate dữ liệu cập nhật lịch hẹn
 * @param {Object} data Dữ liệu lịch hẹn
 * @returns {Array} Danh sách lỗi
 */
const validateUpdateAppointment = [
  body('patient_id')
    .optional()
    .isMongoId().withMessage('ID bệnh nhân không hợp lệ'),
  
  body('appointment_date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Ngày hẹn phải có định dạng YYYY-MM-DD'),
  
  body('appointment_time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Thời gian hẹn phải có định dạng HH:MM'),
  
  body('status')
    .optional()
    .isIn(validStatuses).withMessage(`Trạng thái phải là một trong các giá trị: ${validStatuses.join(', ')}`),
  
  body('reason')
    .optional()
    .isString().withMessage('Lý do khám phải là chuỗi')
    .isLength({ max: 500 }).withMessage('Lý do khám không được vượt quá 500 ký tự'),
  
  body('notes')
    .optional()
    .isString().withMessage('Ghi chú phải là chuỗi')
    .isLength({ max: 1000 }).withMessage('Ghi chú không được vượt quá 1000 ký tự'),
];

/**
 * Validate dữ liệu tìm kiếm lịch hẹn
 * @param {Object} criteria Tiêu chí tìm kiếm
 * @returns {Array} Danh sách lỗi
 */
const validateSearchAppointment = [
  query('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Ngày hẹn phải có định dạng YYYY-MM-DD'),
  
  query('patient_id')
    .optional()
    .isMongoId().withMessage('ID bệnh nhân không hợp lệ'),
  
  query('status')
    .optional()
    .isIn([...validStatuses, 'all']).withMessage(`Trạng thái phải là một trong các giá trị: ${validStatuses.join(', ')} hoặc 'all'`),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Trang phải là số nguyên dương'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Số lượng mỗi trang phải là số nguyên dương và không vượt quá 100'),
];

/**
 * Validate dữ liệu cập nhật trạng thái lịch hẹn
 * @param {Object} data Dữ liệu cập nhật
 * @returns {Array} Danh sách lỗi
 */
const validateUpdateStatus = [
  body('status')
    .notEmpty().withMessage('Trạng thái không được để trống')
    .isIn(validStatuses).withMessage(`Trạng thái phải là một trong các giá trị: ${validStatuses.join(', ')}`),
];

module.exports = {
  validateCreateAppointment,
  validateUpdateAppointment,
  validateSearchAppointment,
  validateUpdateStatus,
  validStatuses
}; 