/**
 * Database Utility
 * Cung cấp các phương thức tối ưu hóa truy vấn cơ sở dữ liệu
 */
const logger = require('./logger');

/**
 * Tạo truy vấn WHERE với các điều kiện động
 * @param {Object} conditions - Các điều kiện truy vấn
 * @param {string} tableAlias - Bí danh của bảng (mặc định: '')
 * @returns {Object} Truy vấn SQL và các tham số
 */
const buildWhereClause = (conditions, tableAlias = '') => {
  const prefix = tableAlias ? `${tableAlias}.` : '';
  const clauses = [];
  const params = [];
  let paramIndex = 1;

  Object.entries(conditions).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Xử lý các loại điều kiện khác nhau
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          // Mảng giá trị (IN)
          if (value.length > 0) {
            const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
            clauses.push(`${prefix}${key} IN (${placeholders})`);
            params.push(...value);
          }
        } else if (value.hasOwnProperty('$lt')) {
          clauses.push(`${prefix}${key} < $${paramIndex++}`);
          params.push(value.$lt);
        } else if (value.hasOwnProperty('$lte')) {
          clauses.push(`${prefix}${key} <= $${paramIndex++}`);
          params.push(value.$lte);
        } else if (value.hasOwnProperty('$gt')) {
          clauses.push(`${prefix}${key} > $${paramIndex++}`);
          params.push(value.$gt);
        } else if (value.hasOwnProperty('$gte')) {
          clauses.push(`${prefix}${key} >= $${paramIndex++}`);
          params.push(value.$gte);
        } else if (value.hasOwnProperty('$like')) {
          clauses.push(`${prefix}${key} ILIKE $${paramIndex++}`);
          params.push(`%${value.$like}%`);
        } else if (value.hasOwnProperty('$between')) {
          const [start, end] = value.$between;
          clauses.push(`${prefix}${key} BETWEEN $${paramIndex++} AND $${paramIndex++}`);
          params.push(start, end);
        }
      } else {
        // Giá trị đơn (=)
        clauses.push(`${prefix}${key} = $${paramIndex++}`);
        params.push(value);
      }
    }
  });

  // Mặc định trả về điều kiện 1=1 nếu không có điều kiện nào
  const whereClause = clauses.length > 0
    ? `WHERE ${clauses.join(' AND ')}`
    : 'WHERE 1=1';

  return {
    whereClause,
    params,
    paramIndex
  };
};

/**
 * Tạo truy vấn ORDER BY
 * @param {string|Object} sortOptions - Tùy chọn sắp xếp
 * @returns {string} Mệnh đề ORDER BY
 */
const buildOrderByClause = (sortOptions) => {
  if (!sortOptions) {
    return '';
  }

  if (typeof sortOptions === 'string') {
    return `ORDER BY ${sortOptions}`;
  }

  if (typeof sortOptions === 'object') {
    const sortFields = Object.entries(sortOptions)
      .map(([field, order]) => `${field} ${order.toUpperCase()}`)
      .join(', ');
    
    return sortFields ? `ORDER BY ${sortFields}` : '';
  }

  return '';
};

/**
 * Tạo truy vấn LIMIT và OFFSET cho phân trang
 * @param {number} limit - Số lượng bản ghi tối đa
 * @param {number} page - Trang hiện tại
 * @returns {string} Mệnh đề LIMIT và OFFSET
 */
const buildPaginationClause = (limit, page) => {
  if (!limit) {
    return '';
  }

  const offset = page && page > 1 ? (page - 1) * limit : 0;
  return `LIMIT ${limit} OFFSET ${offset}`;
};

/**
 * Ghi log truy vấn SQL
 * @param {string} sql - Truy vấn SQL
 * @param {Array} params - Tham số truy vấn
 * @param {number} executionTime - Thời gian thực thi (ms)
 */
const logQuery = (sql, params, executionTime) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Query: ${sql}`);
    logger.debug(`Params: ${JSON.stringify(params)}`);
    logger.debug(`Execution time: ${executionTime}ms`);
  }
};

/**
 * Thực thi truy vấn với đo thời gian thực thi
 * @param {Function} queryFn - Hàm thực thi truy vấn
 * @param {string} sql - Truy vấn SQL
 * @param {Array} params - Tham số truy vấn
 * @returns {Promise<Object>} Kết quả truy vấn
 */
const executeWithTiming = async (queryFn, sql, params) => {
  const startTime = Date.now();
  try {
    const result = await queryFn(sql, params);
    const executionTime = Date.now() - startTime;
    logQuery(sql, params, executionTime);
    return result;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    logQuery(sql, params, executionTime);
    logger.error(`Query error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  buildWhereClause,
  buildOrderByClause,
  buildPaginationClause,
  executeWithTiming
}; 