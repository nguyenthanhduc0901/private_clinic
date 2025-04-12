/**
 * Server Manager
 * Quản lý việc khởi tạo và chạy HTTP Server
 */
const db = require('./config/database');

/**
 * Khởi động server trên cổng xác định
 * @param {Express} app Express application instance
 * @param {number} port Cổng mạng để lắng nghe
 * @returns {http.Server} HTTP server instance
 */
const startServer = (app, port) => {
    // Xử lý trường hợp cổng đã được sử dụng
    const handlePortInUse = (server, port) => {
        console.log(`Cổng ${port} đã được sử dụng, đang thử cổng ${port + 1}...`);
        const newPort = port + 1;
        server.close();
        return startServer(app, newPort);
    };

    // Bắt đầu lắng nghe kết nối
    const server = app.listen(port, () => {
        console.log(`Server đang chạy tại http://localhost:${port}`);
        console.log('Môi trường:', process.env.NODE_ENV || 'development');
        
        // Kiểm tra kết nối database khi khởi động
        db.testConnection()
            .then(connected => {
                if (connected) {
                    console.log('Database kết nối thành công');
                } else {
                    console.error('Không thể kết nối đến database');
                }
            });
    });

    // Xử lý lỗi khi khởi động server
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            return handlePortInUse(server, port);
        } else {
            console.error('Lỗi khởi động server:', err);
            process.exit(1);
        }
    });

    // Xử lý khi server đóng
    server.on('close', () => {
        console.log('Server đã đóng');
    });

    return server;
};

/**
 * Thiết lập các handler cho lỗi cấp quy trình
 */
const setupProcessErrorHandlers = () => {
    // Xử lý lỗi không đồng bộ
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Xử lý lỗi ngoại lệ không bắt được
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        process.exit(1);
    });

    // Xử lý tín hiệu tắt server
    process.on('SIGTERM', () => {
        console.log('Nhận tín hiệu SIGTERM, đóng ứng dụng...');
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log('Nhận tín hiệu SIGINT, đóng ứng dụng...');
        process.exit(0);
    });
};

module.exports = {
    startServer,
    setupProcessErrorHandlers
}; 