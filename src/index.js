/**
 * Entry Point
 * Điểm khởi đầu của ứng dụng, kết nối tất cả các thành phần
 */
require('dotenv').config();

// Import modules
const setupApp = require('./config/app');
const setupRoutes = require('./routes');
const { startServer, setupProcessErrorHandlers } = require('./server');

// Khởi tạo ứng dụng Express
const app = setupApp();

// Thiết lập routes
setupRoutes(app);

// Thiết lập xử lý lỗi cấp quy trình
setupProcessErrorHandlers();

// Khởi động server
const PORT = process.env.PORT || 3000;
startServer(app, PORT);

module.exports = app; 