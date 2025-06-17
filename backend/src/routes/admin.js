const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// Admin management
router.post('/add-admin', adminController.addAdmin);
router.put('/update-admin/:id', adminController.updateAdmin);
router.delete('/delete-admin/:id', adminController.deleteAdmin);
router.get('/admins', adminController.getAdmins);

// User management
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);

// Admin role management
router.post('/make-admin/:id', adminController.makeAdmin);
router.post('/remove-admin/:id', adminController.removeAdmin);

module.exports = router; 