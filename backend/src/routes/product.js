const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const upload = require('../config/upload');
const {
    createProductValidation,
    updateProductValidation,
    productFiltersValidation
} = require('../validations/productValidations');


// Public routes
router.get('/', productController.getProducts);

// Protected routes
router.use(protect);

// User product routes
router.get('/user/products', validate(productFiltersValidation), productController.getUserProducts);
router.post('/', upload.single('image'), validate(createProductValidation), productController.createProduct);
router.put('/:id', upload.single('image'), validate(updateProductValidation), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// This should come last as it's a catch-all for IDs
router.get('/:id', productController.getProduct);

module.exports = router; 