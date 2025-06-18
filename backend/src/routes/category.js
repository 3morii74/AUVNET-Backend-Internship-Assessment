const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');


// Public routes
router.get('/', categoryController.getCategories);

// Protected routes
router.use(protect);

// Admin only routes
router.post('/', restrictTo('admin'), categoryController.createCategory);
router.put('/:id', restrictTo('admin'), categoryController.updateCategory);
router.delete('/:id', restrictTo('admin'), categoryController.deleteCategory);

// Protected routes (any authenticated user)
router.get('/tree', categoryController.getCategoryTree);
router.get('/:id', categoryController.getCategoryById);

module.exports = router; 