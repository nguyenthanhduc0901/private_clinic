/**
 * Validation Middleware
 * Cung cấp các middleware cho validation
 */
const { validationError } = require('../utils/responseHandler');

/**
 * Middleware validate body request
 * @param {Function} validator Function validator
 * @returns {Function} Express middleware
 */
const validateBody = (validator) => {
    return (req, res, next) => {
        const validationErrors = validator(req.body);
        
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
            return validationError(res, validationErrors);
        }
        
        next();
    };
};

/**
 * Middleware validate params request
 * @param {Function} validator Function validator
 * @returns {Function} Express middleware
 */
const validateParams = (validator) => {
    return (req, res, next) => {
        const validationErrors = validator(req.params);
        
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
            return validationError(res, validationErrors);
        }
        
        next();
    };
};

/**
 * Middleware validate query request
 * @param {Function} validator Function validator
 * @returns {Function} Express middleware
 */
const validateQuery = (validator) => {
    return (req, res, next) => {
        const validationErrors = validator(req.query);
        
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
            return validationError(res, validationErrors);
        }
        
        next();
    };
};

/**
 * Validate ID là số hợp lệ
 * @param {Object} params Params object
 * @returns {Array} Error array
 */
const validateIdParam = (params) => {
    const errors = [];
    const { id } = params;
    
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        errors.push({
            field: 'id',
            message: 'ID phải là số dương hợp lệ'
        });
    }
    
    return errors;
};

module.exports = {
    validateBody,
    validateParams,
    validateQuery,
    validateIdParam
}; 