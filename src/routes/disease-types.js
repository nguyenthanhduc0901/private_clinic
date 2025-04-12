const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Áp dụng middleware xác thực cho tất cả routes
router.use(verifyToken);

// GET: Lấy danh sách loại bệnh
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM disease_types ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách loại bệnh',
            error: error.message
        });
    }
});

// GET: Lấy chi tiết loại bệnh
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM disease_types WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy loại bệnh' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy chi tiết loại bệnh',
            error: error.message
        });
    }
});

// POST: Thêm loại bệnh mới
router.post('/', checkPermission('manage_medical_records'), async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Tên loại bệnh không được để trống' });
        }

        const result = await db.query(
            'INSERT INTO disease_types (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi thêm loại bệnh',
            error: error.message
        });
    }
});

// PUT: Cập nhật loại bệnh
router.put('/:id', checkPermission('manage_medical_records'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Tên loại bệnh không được để trống' });
        }

        const result = await db.query(
            'UPDATE disease_types SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy loại bệnh' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi cập nhật loại bệnh',
            error: error.message
        });
    }
});

// DELETE: Xóa loại bệnh
router.delete('/:id', checkPermission('manage_medical_records'), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra xem loại bệnh có được sử dụng trong bảng medical_records không
        const usageCheck = await db.query(
            'SELECT COUNT(*) FROM medical_records WHERE disease_type_id = $1',
            [id]
        );
        
        if (parseInt(usageCheck.rows[0].count) > 0) {
            return res.status(400).json({
                message: 'Không thể xóa loại bệnh đã được sử dụng trong phiếu khám'
            });
        }

        const result = await db.query(
            'DELETE FROM disease_types WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy loại bệnh' });
        }

        res.json({
            message: 'Đã xóa loại bệnh thành công',
            disease_type: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi xóa loại bệnh',
            error: error.message
        });
    }
});

module.exports = router; 