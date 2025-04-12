const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware xác thực JWT token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        
        // Lấy thông tin user từ database
        const result = await db.query(
            `SELECT 
                s.id, s.username, s.full_name, 
                r.name as role_name
            FROM staff s
            JOIN roles r ON s.role_id = r.id
            WHERE s.id = $1 AND s.is_active = true`,
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Người dùng không tồn tại hoặc đã bị vô hiệu hóa' });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token không hợp lệ' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token đã hết hạn' });
        }
        res.status(500).json({ message: 'Lỗi xác thực', error: error.message });
    }
};

// Middleware kiểm tra quyền
const checkPermission = (permission) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Chưa xác thực' });
        }

        // Admin có tất cả quyền
        if (req.user.role_name === 'admin') {
            return next();
        }

        // Kiểm tra quyền
        const result = await db.query(
            `SELECT COUNT(*) 
            FROM role_permissions rp 
            JOIN permissions p ON rp.permission_id = p.id 
            JOIN roles r ON rp.role_id = r.id
            WHERE r.name = $1 AND p.name = $2`,
            [req.user.role_name, permission]
        );

        if (parseInt(result.rows[0].count) > 0) {
            next();
        } else {
            res.status(403).json({ message: 'Không có quyền thực hiện thao tác này' });
        }
    };
};

module.exports = {
    verifyToken,
    checkPermission
}; 