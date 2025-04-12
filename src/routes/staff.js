const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Áp dụng middleware xác thực cho tất cả routes
router.use(verifyToken);

// GET: Lấy danh sách nhân viên
router.get('/', checkPermission('manage_staff'), async (req, res) => {
    try {
        const result = await db.query(
            `SELECT s.id, s.username, s.full_name, s.email, s.phone, 
                    r.name as role_name, s.is_active, s.last_login, s.created_at
            FROM staff s
            JOIN roles r ON s.role_id = r.id
            ORDER BY s.id DESC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách nhân viên',
            error: error.message
        });
    }
});

// POST: Thêm nhân viên mới
router.post('/', checkPermission('manage_staff'), async (req, res) => {
    try {
        const { username, password, full_name, email, phone, role_id } = req.body;

        // Kiểm tra username đã tồn tại
        const existingUser = await db.query(
            'SELECT id FROM staff WHERE username = $1',
            [username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: 'Tên đăng nhập đã tồn tại'
            });
        }

        // Hash mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Thêm nhân viên mới
        const result = await db.query(
            `INSERT INTO staff (username, password_hash, full_name, email, phone, role_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id`,
            [username, hashedPassword, full_name, email, phone, role_id]
        );

        res.status(201).json({
            message: 'Thêm nhân viên thành công',
            id: result.rows[0].id
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi thêm nhân viên',
            error: error.message
        });
    }
});

// PUT: Cập nhật thông tin nhân viên
router.put('/:id', checkPermission('manage_staff'), async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, role_id, is_active } = req.body;

        const result = await db.query(
            `UPDATE staff 
            SET full_name = $1, email = $2, phone = $3, role_id = $4, 
                is_active = $5, updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING id`,
            [full_name, email, phone, role_id, is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy nhân viên'
            });
        }

        res.json({
            message: 'Cập nhật thông tin nhân viên thành công',
            id: result.rows[0].id
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi cập nhật thông tin nhân viên',
            error: error.message
        });
    }
});

// DELETE: Xóa nhân viên
router.delete('/:id', checkPermission('manage_staff'), async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra xem nhân viên có liên quan đến dữ liệu khác không
        const relatedRecords = await db.query(
            `SELECT 
                (SELECT COUNT(*) FROM medical_records WHERE staff_id = $1) +
                (SELECT COUNT(*) FROM prescriptions WHERE staff_id = $1) +
                (SELECT COUNT(*) FROM invoices WHERE staff_id = $1) as total`,
            [id]
        );

        if (relatedRecords.rows[0].total > 0) {
            // Nếu có dữ liệu liên quan, chỉ vô hiệu hóa tài khoản
            await db.query(
                'UPDATE staff SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
                [id]
            );

            return res.json({
                message: 'Nhân viên đã được vô hiệu hóa do có dữ liệu liên quan'
            });
        }

        // Nếu không có dữ liệu liên quan, xóa hoàn toàn
        const result = await db.query(
            'DELETE FROM staff WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy nhân viên'
            });
        }

        res.json({
            message: 'Xóa nhân viên thành công'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi xóa nhân viên',
            error: error.message
        });
    }
});

// GET: Lấy danh sách vai trò
router.get('/roles', checkPermission('manage_staff'), async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM roles ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách vai trò',
            error: error.message
        });
    }
});

// GET: Lấy danh sách quyền hạn của vai trò
router.get('/roles/:id/permissions', checkPermission('manage_staff'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT p.* 
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = $1
            ORDER BY p.id`,
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách quyền hạn',
            error: error.message
        });
    }
});

module.exports = router; 