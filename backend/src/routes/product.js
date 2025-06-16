const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/authMiddleware');
const checkProductOwnership = require('../middlewares/checkProductOwnership');
const upload = require('../config/upload');

// All routes require authentication
router.use(auth);

// Admin routes
router.delete('/admin/:id', (req, res, next) => {
    // Check if user is admin
    if (req.user.type !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
}, productController.deleteProduct);

// Routes with file upload handling
router.post('/', upload.single('image'), productController.createProduct);
router.put('/:id', upload.single('image'), checkProductOwnership, productController.updateProduct);

// Regular routes
router.get('/', productController.getProducts);
router.get('/user', productController.getUserProducts);
router.get('/:id', productController.getProductById);
router.delete('/:id', checkProductOwnership, productController.deleteProduct);

module.exports = router; 