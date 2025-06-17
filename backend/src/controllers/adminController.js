const User = require('../models/User');
const bcrypt = require('bcryptjs');
const adminService = require('../services/adminService');
const asyncHandler = require('../utils/asyncHandler');

// Add admin
exports.addAdmin = asyncHandler(async (req, res) => {
    const admin = await adminService.createAdmin(req.body);
    res.status(201).json({
        message: 'Admin created successfully',
        admin
    });
});

// Update admin
exports.updateAdmin = asyncHandler(async (req, res) => {
    const admin = await adminService.updateAdmin(req.params.id, req.user.userId, req.body);
    res.json({
        message: 'Admin updated successfully',
        admin
    });
});

// Delete admin
exports.deleteAdmin = asyncHandler(async (req, res) => {
    await adminService.deleteAdmin(req.params.id, req.user.userId);
    res.json({ message: 'Admin deleted successfully' });
});

// Get all admins (paginated)
exports.getAdmins = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await adminService.getAdmins(page, limit);
    res.json(result);
});

// Get all users (paginated)
exports.getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await adminService.getUsers(page, limit);
    res.json(result);
});

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id, type: 'user' });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Make a user an admin
exports.makeAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.type === 'admin') {
            return res.status(400).json({ message: 'User is already an admin' });
        }
        user.type = 'admin';
        await user.save();
        res.json({ message: 'User promoted to admin successfully' });
    } catch (err) {
        console.error('Error in makeAdmin:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Remove admin privileges
exports.removeAdmin = async (req, res) => {
    try {
        if (req.user.userId === req.params.id) {
            return res.status(400).json({ message: 'Cannot remove your own admin privileges' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.type !== 'admin') {
            return res.status(400).json({ message: 'User is not an admin' });
        }
        user.type = 'user';
        await user.save();
        res.json({ message: 'Admin privileges removed successfully' });
    } catch (err) {
        console.error('Error in removeAdmin:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}; 