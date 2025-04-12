/**
 * System Routes
 * Các routes hệ thống như kiểm tra database, monitoring, health check
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * @route GET /system/db-test
 * @desc Kiểm tra kết nối database
 */
router.get('/db-test', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({
            message: 'Kết nối database thành công',
            time: result.rows[0].now,
            status: 'ok'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi kết nối database',
            error: error.message,
            status: 'error'
        });
    }
});

/**
 * @route GET /system/health
 * @desc Kiểm tra trạng thái hoạt động của hệ thống
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'up',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

module.exports = router; 