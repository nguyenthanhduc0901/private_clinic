/**
 * Base Service
 * Lớp cơ sở cho tất cả các service, cung cấp các phương thức chung
 */
class BaseService {
    /**
     * Khởi tạo service với repository
     * @param {Object} repository Repository instance
     */
    constructor(repository) {
        this.repository = repository;
    }

    /**
     * Lấy tất cả bản ghi
     * @param {Object} options Tùy chọn truy vấn (phân trang, sắp xếp)
     * @returns {Promise<Object>} Kết quả truy vấn với phân trang
     */
    async getAll(options = {}) {
        const { page = 1, limit = 10, sortBy = 'id', order = 'ASC' } = options;
        const offset = (page - 1) * limit;
        
        const queryOptions = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            orderBy: sortBy,
            order: order.toUpperCase()
        };
        
        // Lấy dữ liệu và tổng số bản ghi
        const data = await this.repository.findAll(queryOptions);
        const total = await this.repository.count();
        
        return {
            data,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };
    }

    /**
     * Lấy bản ghi theo ID
     * @param {number} id ID của bản ghi
     * @returns {Promise<Object>} Bản ghi tìm thấy
     * @throws {Error} Lỗi khi không tìm thấy bản ghi
     */
    async getById(id) {
        const item = await this.repository.findById(id);
        
        if (!item) {
            const error = new Error('Không tìm thấy dữ liệu');
            error.statusCode = 404;
            throw error;
        }
        
        return item;
    }

    /**
     * Tạo bản ghi mới
     * @param {Object} data Dữ liệu bản ghi mới
     * @returns {Promise<Object>} Bản ghi vừa tạo
     */
    async create(data) {
        return await this.repository.create(data);
    }

    /**
     * Cập nhật bản ghi
     * @param {number} id ID của bản ghi
     * @param {Object} data Dữ liệu cập nhật
     * @returns {Promise<Object>} Bản ghi sau khi cập nhật
     * @throws {Error} Lỗi khi không tìm thấy bản ghi
     */
    async update(id, data) {
        // Kiểm tra tồn tại
        await this.getById(id);
        
        // Cập nhật
        return await this.repository.update(id, data);
    }

    /**
     * Xóa bản ghi
     * @param {number} id ID của bản ghi
     * @returns {Promise<boolean>} Kết quả xóa
     * @throws {Error} Lỗi khi không tìm thấy bản ghi
     */
    async delete(id) {
        // Kiểm tra tồn tại
        await this.getById(id);
        
        // Xóa
        return await this.repository.delete(id);
    }
}

module.exports = BaseService; 