/**
 * Model định nghĩa cấu trúc dữ liệu cho cuộc hẹn
 */
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'ID bệnh nhân là bắt buộc']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'ID bác sĩ là bắt buộc']
  },
  date: {
    type: Date,
    required: [true, 'Ngày hẹn là bắt buộc']
  },
  timeSlot: {
    type: String,
    required: [true, 'Khung giờ hẹn là bắt buộc'],
    validate: {
      validator: function(v) {
        // Định dạng khung giờ: HH:MM-HH:MM
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} không phải là định dạng khung giờ hợp lệ (HH:MM-HH:MM)`
    }
  },
  reason: {
    type: String,
    required: [true, 'Lý do khám là bắt buộc'],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      message: '{VALUE} không phải là trạng thái hợp lệ'
    },
    default: 'PENDING'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Tạo các chỉ mục để tối ưu truy vấn
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });

// Plugin phân trang
appointmentSchema.plugin(mongoosePaginate);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 