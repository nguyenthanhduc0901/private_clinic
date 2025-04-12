/**
 * Patient Repository
 * Cung cấp các phương thức thao tác với bảng patients
 */
const BaseRepository = require('./BaseRepository');
const db = require('../config/database');

class PatientRepository extends BaseRepository {
    constructor() {
        super('patients');
    }

    /**
     * Tìm kiếm bệnh nhân theo tên
     * @param {string} name Tên bệnh nhân
     * @param {number} limit Giới hạn số lượng kết quả
     * @returns {Promise<Array>} Danh sách bệnh nhân
     */
    async findByName(name, limit = 10) {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE full_name ILIKE $1
            ORDER BY full_name
            LIMIT $2
        `;
        const result = await db.query(query, [`%${name}%`, limit]);
        return result.rows;
    }

    /**
     * Lấy lịch sử khám bệnh của bệnh nhân
     * @param {number} patientId ID của bệnh nhân
     * @returns {Promise<Array>} Lịch sử khám bệnh
     */
    async getMedicalHistory(patientId) {
        const query = `
            SELECT mr.*, dt.name as disease_name, s.full_name as doctor_name
            FROM medical_records mr
            LEFT JOIN disease_types dt ON mr.disease_type_id = dt.id
            LEFT JOIN staff s ON mr.staff_id = s.id
            WHERE mr.patient_id = $1
            ORDER BY mr.examination_date DESC
        `;
        const result = await db.query(query, [patientId]);
        return result.rows;
    }

    /**
     * Lấy danh sách lịch hẹn của bệnh nhân
     * @param {number} patientId ID của bệnh nhân
     * @returns {Promise<Array>} Danh sách lịch hẹn
     */
    async getAppointments(patientId) {
        const query = `
            SELECT * FROM appointment_lists
            WHERE patient_id = $1
            ORDER BY appointment_date DESC
        `;
        const result = await db.query(query, [patientId]);
        return result.rows;
    }
}

module.exports = new PatientRepository(); 