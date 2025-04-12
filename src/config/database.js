/**
 * Module kết nối và tương tác với PostgreSQL database
 */
const { Pool } = require('pg');
require('dotenv').config();

// Config từ biến môi trường
const dbConfig = {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/private_clinic',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Tạo connection pool
const pool = new Pool(dbConfig);

/**
 * Kiểm tra kết nối database
 * @returns {Promise<boolean>} Trạng thái kết nối
 */
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Đã kết nối thành công đến PostgreSQL');
        client.release();
        return true;
    } catch (error) {
        console.error('Lỗi kết nối đến PostgreSQL:', error);
        return false;
    }
};

// Test kết nối khi khởi động
testConnection();

// Xử lý sự kiện lỗi của pool
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

/**
 * Thực thi truy vấn SQL với logging
 * @param {string} text - Câu truy vấn SQL
 * @param {Array} params - Tham số truy vấn
 * @returns {Promise<Object>} Kết quả truy vấn
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV !== 'production') {
            console.log('Executed query', { 
                text, 
                duration, 
                rows: res.rowCount 
            });
        }
        
        return res;
    } catch (err) {
        console.error('Query error', { 
            text, 
            params, 
            error: err.message 
        });
        throw err;
    }
};

module.exports = {
    query,
    pool,
    testConnection
}; 