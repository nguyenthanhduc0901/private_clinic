/**
 * Base Repository Pattern
 * Cung cấp các phương thức CRUD cơ bản cho các entity
 */
const db = require('../config/database');

class BaseRepository {
    /**
     * Khởi tạo repository với tên bảng
     * @param {string} tableName Tên bảng trong database
     */
    constructor(tableName) {
        this.tableName = tableName;
    }

    /**
     * Lấy tất cả bản ghi
     * @param {Object} options Các tùy chọn query (limit, offset, orderBy, etc.)
     * @returns {Promise<Array>} Danh sách bản ghi
     */
    async findAll(options = {}) {
        const { 
            limit = null, 
            offset = 0, 
            orderBy = 'id', 
            order = 'ASC',
            where = {}
        } = options;

        // Xây dựng câu truy vấn
        let query = `SELECT * FROM ${this.tableName}`;
        const params = [];
        let paramIndex = 1;

        // Xử lý điều kiện WHERE
        const whereKeys = Object.keys(where);
        if (whereKeys.length > 0) {
            query += ' WHERE ';
            const conditions = whereKeys.map(key => {
                params.push(where[key]);
                return `${key} = $${paramIndex++}`;
            });
            query += conditions.join(' AND ');
        }

        // Thêm ORDER BY
        query += ` ORDER BY ${orderBy} ${order}`;

        // Thêm LIMIT và OFFSET
        if (limit !== null) {
            query += ` LIMIT ${limit}`;
        }
        if (offset > 0) {
            query += ` OFFSET ${offset}`;
        }

        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Tìm bản ghi theo ID
     * @param {number} id ID của bản ghi
     * @returns {Promise<Object>} Bản ghi tìm thấy hoặc null
     */
    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Tìm kiếm theo điều kiện
     * @param {Object} criteria Các điều kiện tìm kiếm
     * @returns {Promise<Array>} Các bản ghi tìm thấy
     */
    async findBy(criteria) {
        const keys = Object.keys(criteria);
        const params = Object.values(criteria);
        
        let query = `SELECT * FROM ${this.tableName}`;
        
        if (keys.length > 0) {
            const conditions = keys.map((key, index) => 
                `${key} = $${index + 1}`
            ).join(' AND ');
            
            query += ` WHERE ${conditions}`;
        }
        
        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Tạo bản ghi mới
     * @param {Object} data Dữ liệu của bản ghi mới
     * @returns {Promise<Object>} Bản ghi vừa tạo
     */
    async create(data) {
        const keys = Object.keys(data);
        const params = Object.values(data);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        const columns = keys.join(', ');
        
        const query = `
            INSERT INTO ${this.tableName} (${columns}) 
            VALUES (${placeholders}) 
            RETURNING *
        `;
        
        const result = await db.query(query, params);
        return result.rows[0];
    }

    /**
     * Cập nhật bản ghi
     * @param {number} id ID của bản ghi cần cập nhật
     * @param {Object} data Dữ liệu cập nhật
     * @returns {Promise<Object>} Bản ghi sau khi cập nhật
     */
    async update(id, data) {
        const keys = Object.keys(data);
        const params = Object.values(data);
        
        // Set các trường cần cập nhật
        const setClause = keys.map((key, index) => 
            `${key} = $${index + 1}`
        ).join(', ');
        
        // Thêm ID vào params
        params.push(id);
        
        const query = `
            UPDATE ${this.tableName} 
            SET ${setClause} 
            WHERE id = $${params.length} 
            RETURNING *
        `;
        
        const result = await db.query(query, params);
        return result.rows[0];
    }

    /**
     * Xóa bản ghi
     * @param {number} id ID của bản ghi cần xóa
     * @returns {Promise<boolean>} Kết quả xóa
     */
    async delete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`;
        const result = await db.query(query, [id]);
        return result.rowCount > 0;
    }

    /**
     * Đếm số lượng bản ghi
     * @param {Object} criteria Điều kiện đếm
     * @returns {Promise<number>} Số lượng bản ghi
     */
    async count(criteria = {}) {
        const keys = Object.keys(criteria);
        const params = Object.values(criteria);
        
        let query = `SELECT COUNT(*) FROM ${this.tableName}`;
        
        if (keys.length > 0) {
            const conditions = keys.map((key, index) => 
                `${key} = $${index + 1}`
            ).join(' AND ');
            
            query += ` WHERE ${conditions}`;
        }
        
        const result = await db.query(query, params);
        return parseInt(result.rows[0].count);
    }
}

module.exports = BaseRepository; 