/**
 * Route Manager
 * Tập trung quản lý và thiết lập tất cả routes trong ứng dụng
 */

// Import các router
const patientsRouter = require('./patients');
const appointmentsRouter = require('./appointments');
const medicalRecordsRouter = require('./medical-records');
const authRouter = require('./auth');
const staffRouter = require('./staff');
const invoicesRouter = require('./invoices');
const diseaseTypesRouter = require('./disease-types');
const medicinesRouter = require('./medicines');
const usageInstructionsRouter = require('./usage-instructions');
const settingsRouter = require('./settings');
const systemRouter = require('./system');

// Import middleware
const errorHandler = require('../middleware/errorHandler');
const notFoundHandler = require('../middleware/notFoundHandler');

/**
 * Thiết lập tất cả routes cho ứng dụng
 * @param {Express} app Express application instance
 */
const setupRoutes = (app) => {
    // Basic route
    app.get('/', (req, res) => {
        res.json({ 
            message: 'Server đang chạy',
            environment: process.env.NODE_ENV || 'development'
        });
    });

    // System Routes
    app.use('/system', systemRouter);

    // API Routes
    app.use('/api/auth', authRouter);
    app.use('/api/patients', patientsRouter);
    app.use('/api/appointments', appointmentsRouter);
    app.use('/api/medical-records', medicalRecordsRouter);
    app.use('/api/staff', staffRouter);
    app.use('/api/invoices', invoicesRouter);
    app.use('/api/disease-types', diseaseTypesRouter);
    app.use('/api/medicines', medicinesRouter);
    app.use('/api/usage-instructions', usageInstructionsRouter);
    app.use('/api/settings', settingsRouter);

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);
};

module.exports = setupRoutes; 