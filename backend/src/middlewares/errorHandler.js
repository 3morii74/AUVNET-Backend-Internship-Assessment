const {
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError
} = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
    console.error('Error:', {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Handle known errors
    if (err instanceof ValidationError) {
        return res.status(err.statusCode).json({
            message: err.message,
            details: err.details
        });
    }

    if (err instanceof AuthenticationError) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }

    if (err instanceof AuthorizationError) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }

    if (err instanceof NotFoundError) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const details = {};
        for (let field in err.errors) {
            details[field] = err.errors[field].message;
        }
        return res.status(400).json({
            message: 'Validation error',
            details
        });
    }

    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
        return res.status(400).json({
            message: 'Duplicate key error',
            details: err.keyValue
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Token expired'
        });
    }

    // Handle all other errors
    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler; 