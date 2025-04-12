/**
 * Controller xử lý các chức năng liên quan đến cuộc hẹn
 */
const Appointment = require('../models/Appointment');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');

/**
 * Lấy danh sách cuộc hẹn, có thể lọc theo nhiều tiêu chí
 */
const getAppointments = async (req, res, next) => {
  try {
    const { 
      startDate, endDate, status, 
      patientId, doctorId, 
      page = 1, limit = 10 
    } = req.query;

    const query = {};
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    if (status) query.status = status;
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { date: 1, timeSlot: 1 }, // Sắp xếp theo ngày và giờ
      populate: [
        { path: 'patientId', select: 'name phone email' },
        { path: 'doctorId', select: 'name specialization' }
      ]
    };

    const appointments = await Appointment.paginate(query, options);
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết của một cuộc hẹn theo id
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name phone email')
      .populate('doctorId', 'name specialization');
    
    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy cuộc hẹn');
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo mới cuộc hẹn
 */
const createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, timeSlot, reason, status, notes } = req.body;

    // Kiểm tra xem đã có cuộc hẹn nào trong thời gian này với bác sĩ chưa
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      timeSlot,
      status: { $ne: 'CANCELLED' } // Không tính cuộc hẹn đã hủy
    });

    if (existingAppointment) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Bác sĩ đã có lịch hẹn trong khung giờ này'
      );
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      timeSlot,
      reason,
      status: status || 'PENDING',
      notes
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật thông tin cuộc hẹn
 */
const updateAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const updateData = req.body;

    // Kiểm tra cuộc hẹn tồn tại
    const existingAppointment = await Appointment.findById(appointmentId);
    if (!existingAppointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy cuộc hẹn');
    }

    // Nếu có thay đổi ngày giờ, kiểm tra xung đột lịch
    if (updateData.date || updateData.timeSlot) {
      const date = updateData.date || existingAppointment.date;
      const timeSlot = updateData.timeSlot || existingAppointment.timeSlot;
      const doctorId = updateData.doctorId || existingAppointment.doctorId;

      const conflictAppointment = await Appointment.findOne({
        _id: { $ne: appointmentId }, // Không tính cuộc hẹn hiện tại
        doctorId,
        date: new Date(date),
        timeSlot,
        status: { $ne: 'CANCELLED' }
      });

      if (conflictAppointment) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          'Bác sĩ đã có lịch hẹn trong khung giờ này'
        );
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId doctorId');

    res.status(StatusCodes.OK).json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật trạng thái cuộc hẹn
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy cuộc hẹn');
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    
    await appointment.save();

    res.status(StatusCodes.OK).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa cuộc hẹn
 */
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy cuộc hẹn');
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã xóa cuộc hẹn thành công'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment
}; 