const { body, param, query } = require('express-validator');

const createProductValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
    body('price')
        .notEmpty().withMessage('Price is required')
        .toFloat()
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isMongoId().withMessage('Invalid category ID')
];

const updateProductValidation = [
    param('id')
        .isMongoId().withMessage('Invalid product ID'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category')
        .optional()
        .isMongoId().withMessage('Invalid category ID')
];

const productFiltersValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('minPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
    query('maxPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Maximum price must be a positive number')
        .custom((value, { req }) => {
            if (req.query.minPrice && parseFloat(value) <= parseFloat(req.query.minPrice)) {
                throw new Error('Maximum price must be greater than minimum price');
            }
            return true;
        }),
    query('category')
        .optional()
        .isMongoId().withMessage('Invalid category ID')
];

module.exports = {
    createProductValidation,
    updateProductValidation,
    productFiltersValidation
}; 