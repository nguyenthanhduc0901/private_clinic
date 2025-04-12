/**
 * Appointment Repository
 * Thao tác với bảng appointment_lists
 */
const BaseRepository = require('./BaseRepository');
const db = require('../config/database');

class AppointmentRepository extends BaseRepository {
    constructor() {
        super('appointment_lists');
    }

    /**
     * Lấy danh sách lịch hẹn theo ngày
     * @param {string} date Ngày cần lấy lịch hẹn (định dạng YYYY-MM-DD)
     * @returns {Promise<Array>} Danh sách lịch hẹn
     */
    async getByDate(date) {
        const query = `
            SELECT a.*, p.full_name as patient_name, p.gender, p.birth_year, p.phone
            FROM appointment_lists a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.appointment_date = $1
            ORDER BY a.order_number
        `;
        
        const result = await db.query(query, [date]);
        return result.rows;
    }

    /**
     * Tìm kiếm lịch hẹn theo nhiều tiêu chí
     * @param {Object} criteria Tiêu chí tìm kiếm
     * @returns {Promise<Array>} Danh sách lịch hẹn
     */
    async search(criteria) {
        const { 
            patientId, 
            status,
            startDate, 
            endDate,
            keyword,
            limit = 10,
            offset = 0
        } = criteria;
        
        let query = `
            SELECT a.*, p.full_name as patient_name, p.gender, p.birth_year, p.phone
            FROM appointment_lists a
            JOIN patients p ON a.patient_id = p.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (patientId) {
            query += ` AND a.patient_id = $${paramIndex++}`;
            params.push(patientId);
        }
        
        if (status) {
            query += ` AND a.status = $${paramIndex++}`;
            params.push(status);
        }
        
        if (startDate) {
            query += ` AND a.appointment_date >= $${paramIndex++}`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND a.appointment_date <= $${paramIndex++}`;
            params.push(endDate);
        }
        
        if (keyword) {
            query += ` AND (
                p.full_name ILIKE $${paramIndex} OR
                p.phone ILIKE $${paramIndex} OR
                a.notes ILIKE $${paramIndex}
            )`;
            params.push(`%${keyword}%`);
            paramIndex++;
        }
        
        // Thêm sắp xếp và phân trang
        query += ` ORDER BY a.appointment_date DESC, a.order_number
                   LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);
        
        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Đếm tổng số lịch hẹn theo tiêu chí tìm kiếm
     * @param {Object} criteria Tiêu chí tìm kiếm
     * @returns {Promise<number>} Tổng số lịch hẹn
     */
    async countSearch(criteria) {
        const { 
            patientId, 
            status,
            startDate, 
            endDate,
            keyword
        } = criteria;
        
        let query = `
            SELECT COUNT(*) as total
            FROM appointment_lists a
            JOIN patients p ON a.patient_id = p.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (patientId) {
            query += ` AND a.patient_id = $${paramIndex++}`;
            params.push(patientId);
        }
        
        if (status) {
            query += ` AND a.status = $${paramIndex++}`;
            params.push(status);
        }
        
        if (startDate) {
            query += ` AND a.appointment_date >= $${paramIndex++}`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND a.appointment_date <= $${paramIndex++}`;
            params.push(endDate);
        }
        
        if (keyword) {
            query += ` AND (
                p.full_name ILIKE $${paramIndex} OR
                p.phone ILIKE $${paramIndex} OR
                a.notes ILIKE $${paramIndex}
            )`;
            params.push(`%${keyword}%`);
        }
        
        const result = await db.query(query, params);
        return parseInt(result.rows[0].total);
    }

    /**
     * Lấy số thứ tự tiếp theo cho lịch hẹn
     * @param {string} date Ngày của lịch hẹn
     * @returns {Promise<number>} Số thứ tự tiếp theo
     */
    async getNextOrderNumber(date) {
        const query = `
            SELECT COALESCE(MAX(order_number), 0) + 1 as next_order
            FROM appointment_lists
            WHERE appointment_date = $1
        `;
        
        const result = await db.query(query, [date]);
        return parseInt(result.rows[0].next_order);
    }

    /**
     * Cập nhật trạng thái lịch hẹn
     * @param {number} id ID của lịch hẹn
     * @param {string} status Trạng thái mới
     * @returns {Promise<Object>} Lịch hẹn sau khi cập nhật
     */
    async updateStatus(id, status) {
        const query = `
            UPDATE appointment_lists
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        
        const result = await db.query(query, [status, id]);
        return result.rows[0];
    }
}

module.exports = new AppointmentRepository(); 