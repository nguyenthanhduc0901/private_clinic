/**
 * Medical Record Repository
 * Thao tác với bảng medical_records
 */
const BaseRepository = require('./BaseRepository');
const db = require('../config/database');

class MedicalRecordRepository extends BaseRepository {
    constructor() {
        super('medical_records');
    }

    /**
     * Lấy chi tiết bệnh án với thông tin liên quan
     * @param {number} id ID của bệnh án
     * @returns {Promise<Object>} Chi tiết bệnh án
     */
    async getDetailById(id) {
        const query = `
            SELECT mr.*, 
                   p.full_name as patient_name,
                   s.full_name as doctor_name,
                   dt.name as disease_name
            FROM medical_records mr
            LEFT JOIN patients p ON mr.patient_id = p.id
            LEFT JOIN staff s ON mr.staff_id = s.id
            LEFT JOIN disease_types dt ON mr.disease_type_id = dt.id
            WHERE mr.id = $1
        `;
        
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Lấy tất cả đơn thuốc của bệnh án
     * @param {number} medicalRecordId ID của bệnh án
     * @returns {Promise<Array>} Danh sách đơn thuốc
     */
    async getPrescriptions(medicalRecordId) {
        const query = `
            SELECT p.*, 
                   m.name as medicine_name, 
                   m.unit as medicine_unit,
                   m.price as medicine_price,
                   ui.instruction as usage_instruction
            FROM prescriptions p
            JOIN medicines m ON p.medicine_id = m.id
            JOIN usage_instructions ui ON p.usage_instruction_id = ui.id
            WHERE p.medical_record_id = $1
        `;
        
        const result = await db.query(query, [medicalRecordId]);
        return result.rows;
    }

    /**
     * Lấy hóa đơn của bệnh án
     * @param {number} medicalRecordId ID của bệnh án
     * @returns {Promise<Object>} Hóa đơn
     */
    async getInvoice(medicalRecordId) {
        const query = `
            SELECT *
            FROM invoices
            WHERE medical_record_id = $1
        `;
        
        const result = await db.query(query, [medicalRecordId]);
        return result.rows[0] || null;
    }

    /**
     * Tìm kiếm bệnh án theo nhiều tiêu chí
     * @param {Object} criteria Tiêu chí tìm kiếm
     * @returns {Promise<Array>} Danh sách bệnh án
     */
    async search(criteria) {
        const { 
            patientId, 
            staffId, 
            diseaseTypeId, 
            startDate, 
            endDate,
            keyword,
            limit = 10,
            offset = 0
        } = criteria;
        
        let query = `
            SELECT mr.*, 
                   p.full_name as patient_name,
                   s.full_name as doctor_name,
                   dt.name as disease_name
            FROM medical_records mr
            LEFT JOIN patients p ON mr.patient_id = p.id
            LEFT JOIN staff s ON mr.staff_id = s.id
            LEFT JOIN disease_types dt ON mr.disease_type_id = dt.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (patientId) {
            query += ` AND mr.patient_id = $${paramIndex++}`;
            params.push(patientId);
        }
        
        if (staffId) {
            query += ` AND mr.staff_id = $${paramIndex++}`;
            params.push(staffId);
        }
        
        if (diseaseTypeId) {
            query += ` AND mr.disease_type_id = $${paramIndex++}`;
            params.push(diseaseTypeId);
        }
        
        if (startDate) {
            query += ` AND mr.examination_date >= $${paramIndex++}`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND mr.examination_date <= $${paramIndex++}`;
            params.push(endDate);
        }
        
        if (keyword) {
            query += ` AND (
                p.full_name ILIKE $${paramIndex} OR
                mr.symptoms ILIKE $${paramIndex} OR
                mr.diagnosis ILIKE $${paramIndex} OR
                dt.name ILIKE $${paramIndex}
            )`;
            params.push(`%${keyword}%`);
            paramIndex++;
        }
        
        // Thêm sắp xếp và phân trang
        query += ` ORDER BY mr.examination_date DESC
                   LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);
        
        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Đếm tổng số bản ghi theo tiêu chí tìm kiếm
     * @param {Object} criteria Tiêu chí tìm kiếm
     * @returns {Promise<number>} Tổng số bản ghi
     */
    async countSearch(criteria) {
        const { 
            patientId, 
            staffId, 
            diseaseTypeId, 
            startDate, 
            endDate,
            keyword
        } = criteria;
        
        let query = `
            SELECT COUNT(*) as total
            FROM medical_records mr
            LEFT JOIN patients p ON mr.patient_id = p.id
            LEFT JOIN staff s ON mr.staff_id = s.id
            LEFT JOIN disease_types dt ON mr.disease_type_id = dt.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (patientId) {
            query += ` AND mr.patient_id = $${paramIndex++}`;
            params.push(patientId);
        }
        
        if (staffId) {
            query += ` AND mr.staff_id = $${paramIndex++}`;
            params.push(staffId);
        }
        
        if (diseaseTypeId) {
            query += ` AND mr.disease_type_id = $${paramIndex++}`;
            params.push(diseaseTypeId);
        }
        
        if (startDate) {
            query += ` AND mr.examination_date >= $${paramIndex++}`;
            params.push(startDate);
        }
        
        if (endDate) {
            query += ` AND mr.examination_date <= $${paramIndex++}`;
            params.push(endDate);
        }
        
        if (keyword) {
            query += ` AND (
                p.full_name ILIKE $${paramIndex} OR
                mr.symptoms ILIKE $${paramIndex} OR
                mr.diagnosis ILIKE $${paramIndex} OR
                dt.name ILIKE $${paramIndex}
            )`;
            params.push(`%${keyword}%`);
        }
        
        const result = await db.query(query, params);
        return parseInt(result.rows[0].total);
    }
}

module.exports = new MedicalRecordRepository(); 