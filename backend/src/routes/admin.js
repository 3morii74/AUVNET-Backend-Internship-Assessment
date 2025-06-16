const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(auth);

// Middleware to check admin role
router.use((req, res, next) => {
    if (req.user.type !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
});

// Admin management
router.post('/admins', adminController.addAdmin);
router.put('/admins/:id', adminController.updateAdmin);
router.delete('/admins/:id', adminController.deleteAdmin);
router.get('/admins', adminController.getAdmins);

// User management
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router; 