/**
 * Main Application
 * Thiết lập Express app và các middleware
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { logHttpRequest } = require('./utils/logger');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('./utils/ApiError');

// Khởi tạo Express app
const app = express();

// Security Middlewares
app.use(helmet()); // Bảo mật HTTP headers
app.use(cors()); // Cross-Origin Resource Sharing

// Compression middleware
app.use(compression()); // Nén response

// Logging middleware
app.use(logHttpRequest);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Log requests trong môi trường phát triển
} else {
  app.use(morgan('combined')); // Log chi tiết hơn trong môi trường production
}

// Body parsers
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Thiết lập routes
routes(app);

// Route 404 Not Found
app.use((req, res, next) => {
  next(new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy tài nguyên yêu cầu'));
});

// Middleware xử lý lỗi
app.use(errorHandler);

module.exports = app; 