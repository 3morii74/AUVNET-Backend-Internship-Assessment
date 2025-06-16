const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(auth);

// CRUD
router.post('/', categoryController.createCategory); // admin only
router.get('/', categoryController.getCategories); // paginated flat list
router.get('/tree', categoryController.getCategoryTree); // nested tree
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', categoryController.updateCategory); // admin only
router.delete('/:id', categoryController.deleteCategory); // admin only

module.exports = router; 