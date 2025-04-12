const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Áp dụng middleware xác thực cho tất cả routes
router.use(verifyToken);

// GET: Lấy danh sách hướng dẫn sử dụng
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM usage_instructions';
        const params = [];
        
        if (search) {
            query += ' WHERE description ILIKE $1';
            params.push(`%${search}%`);
        }
        
        query += ' ORDER BY description';
        
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách hướng dẫn sử dụng',
            error: error.message
        });
    }
});

// GET: Lấy chi tiết hướng dẫn sử dụng
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM usage_instructions WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy hướng dẫn sử dụng' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy chi tiết hướng dẫn sử dụng',
            error: error.message
        });
    }
});

// POST: Thêm hướng dẫn sử dụng mới
router.post('/', checkPermission('manage_medicines'), async (req, res) => {
    try {
        const { description } = req.body;
        
        if (!description) {
            return res.status(400).json({ message: 'Mô tả hướng dẫn không được để trống' });
        }

        // Kiểm tra xem mô tả đã tồn tại chưa
        const existCheck = await db.query(
            'SELECT * FROM usage_instructions WHERE description = $1',
            [description]
        );
        
        if (existCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Hướng dẫn sử dụng này đã tồn tại' });
        }

        const result = await db.query(
            'INSERT INTO usage_instructions (description) VALUES ($1) RETURNING *',
            [description]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi thêm hướng dẫn sử dụng',
            error: error.message
        });
    }
});

// PUT: Cập nhật hướng dẫn sử dụng
router.put('/:id', checkPermission('manage_medicines'), async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        
        if (!description) {
            return res.status(400).json({ message: 'Mô tả hướng dẫn không được để trống' });
        }

        // Kiểm tra xem mô tả đã tồn tại chưa
        const existCheck = await db.query(
            'SELECT * FROM usage_instructions WHERE description = $1 AND id != $2',
            [description, id]
        );
        
        if (existCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Hướng dẫn sử dụng này đã tồn tại' });
        }

        const result = await db.query(
            'UPDATE usage_instructions SET description = $1 WHERE id = $2 RETURNING *',
            [description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy hướng dẫn sử dụng' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi cập nhật hướng dẫn sử dụng',
            error: error.message
        });
    }
});

// DELETE: Xóa hướng dẫn sử dụng
router.delete('/:id', checkPermission('manage_medicines'), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra xem hướng dẫn có được sử dụng trong đơn thuốc không
        const usageCheck = await db.query(
            'SELECT COUNT(*) FROM prescriptions WHERE usage_instruction_id = $1',
            [id]
        );
        
        if (parseInt(usageCheck.rows[0].count) > 0) {
            return res.status(400).json({
                message: 'Không thể xóa hướng dẫn đã được sử dụng trong đơn thuốc'
            });
        }

        const result = await db.query(
            'DELETE FROM usage_instructions WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy hướng dẫn sử dụng' });
        }

        res.json({
            message: 'Đã xóa hướng dẫn sử dụng thành công',
            instruction: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi xóa hướng dẫn sử dụng',
            error: error.message
        });
    }
});

module.exports = router; 