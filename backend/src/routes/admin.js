const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

// Admin management routes - restricted to super_admin only
router.post('/add-admin', restrictTo('super_admin'), adminController.addAdmin);
router.put('/update-admin/:id', restrictTo('super_admin'), adminController.updateAdmin);
router.delete('/delete-admin/:id', restrictTo('super_admin'), adminController.deleteAdmin);
router.get('/admins', restrictTo('super_admin'), adminController.getAdmins);
router.post('/remove-admin/:id', restrictTo('super_admin'), adminController.removeAdmin);

// User management routes - accessible to both admin and super_admin
router.get('/users', restrictTo('admin', 'super_admin'), adminController.getUsers);
router.delete('/users/:id', restrictTo('admin', 'super_admin'), adminController.deleteUser);

module.exports = router; 