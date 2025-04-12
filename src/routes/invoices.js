const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET: Lấy danh sách hóa đơn
router.get('/', async (req, res) => {
    try {
        const { date, patient_id, status } = req.query;
        let query = `
            SELECT 
                i.*,
                p.full_name, p.gender, p.birth_year,
                m.symptoms,
                d.name as disease_name
            FROM invoices i
            JOIN medical_records m ON i.medical_record_id = m.id
            JOIN patients p ON m.patient_id = p.id
            LEFT JOIN disease_types d ON m.disease_type_id = d.id
        `;
        
        const params = [];
        const conditions = [];

        if (date) {
            params.push(date);
            conditions.push(`DATE(i.payment_date) = $${params.length}`);
        }

        if (patient_id) {
            params.push(patient_id);
            conditions.push(`m.patient_id = $${params.length}`);
        }

        if (status) {
            params.push(status);
            conditions.push(`i.status = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY i.payment_date DESC, i.id DESC';
        
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách hóa đơn',
            error: error.message
        });
    }
});

// GET: Lấy chi tiết hóa đơn
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT 
                i.*,
                p.full_name, p.gender, p.birth_year,
                m.symptoms,
                d.name as disease_name,
                json_agg(json_build_object(
                    'medicine_name', med.name,
                    'quantity', pr.quantity,
                    'unit_price', med.price,
                    'total_price', (med.price * pr.quantity)
                )) as medicines
            FROM invoices i
            JOIN medical_records m ON i.medical_record_id = m.id
            JOIN patients p ON m.patient_id = p.id
            LEFT JOIN disease_types d ON m.disease_type_id = d.id
            LEFT JOIN prescriptions pr ON m.id = pr.medical_record_id
            LEFT JOIN medicines med ON pr.medicine_id = med.id
            WHERE i.id = $1
            GROUP BY i.id, p.full_name, p.gender, p.birth_year, m.symptoms, d.name`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy chi tiết hóa đơn',
            error: error.message
        });
    }
});

// POST: Tạo hóa đơn mới
router.post('/', async (req, res) => {
    try {
        const { medical_record_id } = req.body;

        if (!medical_record_id) {
            return res.status(400).json({ message: 'Thiếu thông tin phiếu khám bệnh' });
        }

        // Bắt đầu transaction
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');

            // Lấy thông tin tiền thuốc
            const medicineResult = await client.query(
                `SELECT COALESCE(SUM(m.price * p.quantity), 0) as total_medicine_fee
                FROM medical_records mr
                LEFT JOIN prescriptions p ON mr.id = p.medical_record_id
                LEFT JOIN medicines m ON p.medicine_id = m.id
                WHERE mr.id = $1`,
                [medical_record_id]
            );

            // Lấy tiền khám từ settings
            const settingResult = await client.query(
                "SELECT setting_value::integer as examination_fee FROM settings WHERE setting_key = 'examination_fee'"
            );

            const examination_fee = settingResult.rows[0]?.examination_fee || 30000; // Mặc định 30,000 VNĐ
            const medicine_fee = medicineResult.rows[0].total_medicine_fee;
            const total_fee = examination_fee + medicine_fee;

            // Tạo hóa đơn
            const invoiceResult = await client.query(
                `INSERT INTO invoices 
                    (medical_record_id, examination_fee, medicine_fee, total_fee, status)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [medical_record_id, examination_fee, medicine_fee, total_fee, 'pending']
            );

            await client.query('COMMIT');

            // Lấy thông tin đầy đủ của hóa đơn vừa tạo
            const result = await db.query(
                `SELECT 
                    i.*,
                    p.full_name, p.gender, p.birth_year,
                    m.symptoms,
                    d.name as disease_name
                FROM invoices i
                JOIN medical_records m ON i.medical_record_id = m.id
                JOIN patients p ON m.patient_id = p.id
                LEFT JOIN disease_types d ON m.disease_type_id = d.id
                WHERE i.id = $1`,
                [invoiceResult.rows[0].id]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi tạo hóa đơn',
            error: error.message
        });
    }
});

// PUT: Cập nhật trạng thái hóa đơn (thanh toán)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'paid', 'cancelled'].includes(status)) {
            return res.status(400).json({ 
                message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: pending, paid, cancelled' 
            });
        }

        const result = await db.query(
            'UPDATE invoices SET status = $1, payment_date = CASE WHEN $1 = \'paid\' THEN CURRENT_TIMESTAMP ELSE payment_date END WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi cập nhật trạng thái hóa đơn',
            error: error.message
        });
    }
});

module.exports = router; 