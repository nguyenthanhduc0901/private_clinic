const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Áp dụng middleware xác thực cho tất cả routes
router.use(verifyToken);

// GET: Lấy tất cả cài đặt
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM settings ORDER BY key');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách cài đặt',
            error: error.message
        });
    }
});

// GET: Lấy cài đặt theo key
router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const result = await db.query('SELECT * FROM settings WHERE key = $1', [key]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy cài đặt' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy chi tiết cài đặt',
            error: error.message
        });
    }
});

// PUT: Cập nhật cài đặt theo key
router.put('/:key', checkPermission('manage_staff'), async (req, res) => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;
        
        if (value === undefined) {
            return res.status(400).json({ message: 'Giá trị không được để trống' });
        }

        const result = await db.query(
            'UPDATE settings SET value = $1, description = $2 WHERE key = $3 RETURNING *',
            [value, description, key]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy cài đặt' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi cập nhật cài đặt',
            error: error.message
        });
    }
});

module.exports = router; 