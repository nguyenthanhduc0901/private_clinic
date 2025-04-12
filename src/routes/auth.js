const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// POST: Đăng nhập
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kiểm tra username và password
        if (!username || !password) {
            return res.status(400).json({
                message: 'Vui lòng nhập đầy đủ thông tin đăng nhập'
            });
        }

        // Tìm nhân viên theo username
        const result = await db.query(
            'SELECT s.*, r.name as role_name FROM staff s JOIN roles r ON s.role_id = r.id WHERE s.username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Tên đăng nhập không tồn tại'
            });
        }

        const staff = result.rows[0];

        // Kiểm tra trạng thái active
        if (!staff.is_active) {
            return res.status(401).json({
                message: 'Tài khoản đã bị vô hiệu hóa'
            });
        }

        // Kiểm tra mật khẩu
        const validPassword = await bcrypt.compare(password, staff.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                message: 'Mật khẩu không chính xác'
            });
        }

        // Tạo JWT token
        const token = jwt.sign(
            { 
                id: staff.id,
                username: staff.username,
                role: staff.role_name
            },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );

        // Cập nhật thời gian đăng nhập cuối
        await db.query(
            'UPDATE staff SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [staff.id]
        );

        // Trả về thông tin và token
        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: staff.id,
                username: staff.username,
                fullName: staff.full_name,
                email: staff.email,
                role: staff.role_name
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi đăng nhập',
            error: error.message
        });
    }
});

// GET: Lấy thông tin người dùng hiện tại
router.get('/me', verifyToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT s.id, s.username, s.full_name, s.email, s.phone, 
                    r.name as role_name, s.created_at, s.last_login
            FROM staff s 
            JOIN roles r ON s.role_id = r.id 
            WHERE s.id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy thông tin nhân viên'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin người dùng',
            error: error.message
        });
    }
});

// POST: Đổi mật khẩu
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới'
            });
        }

        // Kiểm tra mật khẩu hiện tại
        const staff = await db.query(
            'SELECT password_hash FROM staff WHERE id = $1',
            [req.user.id]
        );

        const validPassword = await bcrypt.compare(currentPassword, staff.rows[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({
                message: 'Mật khẩu hiện tại không chính xác'
            });
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu
        await db.query(
            'UPDATE staff SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, req.user.id]
        );

        res.json({
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi đổi mật khẩu',
            error: error.message
        });
    }
});

module.exports = router; 