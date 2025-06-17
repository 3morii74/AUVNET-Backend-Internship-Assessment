const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        // Get validation errors
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        // Debug log: print req.body when validation fails
        console.log('Validation failed. req.body:', req.body);

        // Format errors
        const formattedErrors = {};
        errors.array().forEach(error => {
            formattedErrors[error.path] = error.msg;
        });

        // Throw validation error
        throw new ValidationError('Validation failed', formattedErrors);
    };
};

module.exports = validate; 