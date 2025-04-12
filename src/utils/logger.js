/**
 * Logger Utility
 * Cung cấp chức năng ghi log nhất quán cho ứng dụng
 */
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục logs tồn tại
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Định dạng log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Định dạng log cho console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Tạo logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  defaultMeta: { service: 'clinic-api' },
  transports: [
    // Ghi log lỗi vào file
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    // Ghi tất cả log vào file khác
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// Thêm console transport trong môi trường phát triển
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Thêm log HTTP requests
const logHttpRequest = (req, res, next) => {
  const startHrTime = process.hrtime();
  
  // Ghi log khi response được gửi
  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1000000;
    
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${elapsedTimeInMs.toFixed(3)}ms`,
      userAgent: req.get('user-agent') || '',
      ip: req.ip || req.connection.remoteAddress
    };
    
    // Log cấp độ phù hợp dựa trên status code
    if (res.statusCode >= 500) {
      logger.error('HTTP Request', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

module.exports = logger;
module.exports.logHttpRequest = logHttpRequest; 