const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET: Thống kê doanh thu
router.get('/revenue', async (req, res) => {
    try {
        const { start_date, end_date, group_by = 'day' } = req.query;
        
        let timeGrouping;
        switch (group_by) {
            case 'month':
                timeGrouping = "TO_CHAR(payment_date, 'YYYY-MM')";
                break;
            case 'year':
                timeGrouping = "TO_CHAR(payment_date, 'YYYY')";
                break;
            default: // day
                timeGrouping = "TO_CHAR(payment_date, 'YYYY-MM-DD')";
        }

        const query = `
            SELECT 
                ${timeGrouping} as time_period,
                COUNT(DISTINCT id) as total_invoices,
                SUM(examination_fee) as total_examination_fee,
                SUM(medicine_fee) as total_medicine_fee,
                SUM(total_fee) as total_revenue
            FROM invoices
            WHERE status = 'paid'
                ${start_date ? "AND payment_date >= $1" : ""}
                ${end_date ? `AND payment_date <= ${start_date ? "$2" : "$1"}` : ""}
            GROUP BY ${timeGrouping}
            ORDER BY time_period DESC
        `;

        const params = [];
        if (start_date) params.push(start_date);
        if (end_date) params.push(end_date);

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy thống kê doanh thu',
            error: error.message
        });
    }
});

// GET: Thống kê bệnh nhân
router.get('/patients', async (req, res) => {
    try {
        const { start_date, end_date, group_by = 'day' } = req.query;
        
        let timeGrouping;
        switch (group_by) {
            case 'month':
                timeGrouping = "TO_CHAR(examination_date, 'YYYY-MM')";
                break;
            case 'year':
                timeGrouping = "TO_CHAR(examination_date, 'YYYY')";
                break;
            default: // day
                timeGrouping = "TO_CHAR(examination_date, 'YYYY-MM-DD')";
        }

        const query = `
            SELECT 
                ${timeGrouping} as time_period,
                COUNT(DISTINCT patient_id) as unique_patients,
                COUNT(*) as total_visits
            FROM medical_records
            WHERE 1=1
                ${start_date ? "AND examination_date >= $1" : ""}
                ${end_date ? `AND examination_date <= ${start_date ? "$2" : "$1"}` : ""}
            GROUP BY ${timeGrouping}
            ORDER BY time_period DESC
        `;

        const params = [];
        if (start_date) params.push(start_date);
        if (end_date) params.push(end_date);

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy thống kê bệnh nhân',
            error: error.message
        });
    }
});

// GET: Thống kê bệnh thường gặp
router.get('/diseases', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        const query = `
            SELECT 
                d.name as disease_name,
                COUNT(*) as total_cases,
                COUNT(DISTINCT m.patient_id) as unique_patients
            FROM medical_records m
            JOIN disease_types d ON m.disease_type_id = d.id
            WHERE 1=1
                ${start_date ? "AND m.examination_date >= $1" : ""}
                ${end_date ? `AND m.examination_date <= ${start_date ? "$2" : "$1"}` : ""}
            GROUP BY d.id, d.name
            ORDER BY total_cases DESC
        `;

        const params = [];
        if (start_date) params.push(start_date);
        if (end_date) params.push(end_date);

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy thống kê bệnh',
            error: error.message
        });
    }
});

// GET: Thống kê sử dụng thuốc
router.get('/medicines', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        const query = `
            SELECT 
                m.name as medicine_name,
                SUM(p.quantity) as total_quantity,
                COUNT(DISTINCT mr.patient_id) as unique_patients,
                SUM(m.price * p.quantity) as total_revenue
            FROM prescriptions p
            JOIN medicines m ON p.medicine_id = m.id
            JOIN medical_records mr ON p.medical_record_id = mr.id
            WHERE 1=1
                ${start_date ? "AND mr.examination_date >= $1" : ""}
                ${end_date ? `AND mr.examination_date <= ${start_date ? "$2" : "$1"}` : ""}
            GROUP BY m.id, m.name
            ORDER BY total_quantity DESC
        `;

        const params = [];
        if (start_date) params.push(start_date);
        if (end_date) params.push(end_date);

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy thống kê thuốc',
            error: error.message
        });
    }
});

module.exports = router; 