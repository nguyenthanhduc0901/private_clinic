/**
 * Cấu hình ứng dụng Express
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const setupApp = () => {
    const app = express();

    // Security và utility middleware
    app.use(helmet());
    app.use(cors());
    app.use(compression());
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    return app;
};

module.exports = setupApp; 