const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Áp dụng middleware xác thực cho tất cả routes
router.use(verifyToken);

// GET: Lấy danh sách thuốc
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM medicines';
        const params = [];
        
        if (search) {
            query += ' WHERE name ILIKE $1';
            params.push(`%${search}%`);
        }
        
        query += ' ORDER BY name';
        
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách thuốc',
            error: error.message
        });
    }
});

// GET: Lấy chi tiết thuốc
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM medicines WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thuốc' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy chi tiết thuốc',
            error: error.message
        });
    }
});

// POST: Thêm thuốc mới
router.post('/', checkPermission('manage_medicines'), async (req, res) => {
    try {
        const { name, unit, price, quantity_in_stock, description } = req.body;
        
        if (!name || !unit || price === undefined) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: tên, đơn vị, giá' });
        }

        const result = await db.query(
            'INSERT INTO medicines (name, unit, price, quantity_in_stock, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, unit, price, quantity_in_stock || 0, description]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi thêm thuốc',
            error: error.message
        });
    }
});

// PUT: Cập nhật thông tin thuốc
router.put('/:id', checkPermission('manage_medicines'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, unit, price, quantity_in_stock, description } = req.body;
        
        if (!name || !unit || price === undefined) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: tên, đơn vị, giá' });
        }

        const result = await db.query(
            'UPDATE medicines SET name = $1, unit = $2, price = $3, quantity_in_stock = $4, description = $5 WHERE id = $6 RETURNING *',
            [name, unit, price, quantity_in_stock || 0, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thuốc' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi cập nhật thông tin thuốc',
            error: error.message
        });
    }
});

// PATCH: Cập nhật số lượng thuốc
router.patch('/:id/stock', checkPermission('manage_medicines'), async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity_in_stock } = req.body;
        
        if (quantity_in_stock === undefined) {
            return res.status(400).json({ message: 'Số lượng không được để trống' });
        }

        const result = await db.query(
            'UPDATE medicines SET quantity_in_stock = $1 WHERE id = $2 RETURNING *',
            [quantity_in_stock, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thuốc' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi cập nhật số lượng thuốc',
            error: error.message
        });
    }
});

// DELETE: Xóa thuốc
router.delete('/:id', checkPermission('manage_medicines'), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra xem thuốc có được sử dụng trong đơn thuốc không
        const usageCheck = await db.query(
            'SELECT COUNT(*) FROM prescriptions WHERE medicine_id = $1',
            [id]
        );
        
        if (parseInt(usageCheck.rows[0].count) > 0) {
            return res.status(400).json({
                message: 'Không thể xóa thuốc đã được sử dụng trong đơn thuốc'
            });
        }

        const result = await db.query(
            'DELETE FROM medicines WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thuốc' });
        }

        res.json({
            message: 'Đã xóa thuốc thành công',
            medicine: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi xóa thuốc',
            error: error.message
        });
    }
});

module.exports = router; 