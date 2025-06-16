const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Add admin
exports.addAdmin = async (req, res) => {
    try {
        const { username, email, password, name } = req.body;

        // Validate required fields
        if (!username || !email || !password || !name) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: {
                    username: !username ? 'Username is required' : null,
                    email: !email ? 'Email is required' : null,
                    password: !password ? 'Password is required' : null,
                    name: !name ? 'Name is required' : null
                }
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({
                message: 'Username or email already exists',
                details: {
                    username: existingUser.username === username ? 'Username already taken' : null,
                    email: existingUser.email === email ? 'Email already registered' : null
                }
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user
        const admin = new User({
            username,
            email,
            password: hashedPassword,
            name,
            type: 'admin'
        });

        await admin.save();

        // Return admin data without password
        const adminData = admin.toObject();
        delete adminData.password;

        console.log('Admin created successfully:', adminData);
        res.status(201).json({
            message: 'Admin created successfully',
            admin: adminData
        });
    } catch (err) {
        console.error('Error in addAdmin:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};

// Update admin (not self)
exports.updateAdmin = async (req, res) => {
    try {
        if (req.user.userId === req.params.id) {
            return res.status(400).json({ message: 'Cannot update yourself here' });
        }

        const { name, email, password, username } = req.body;

        // Validate required fields
        if (!name || !email || !username) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: {
                    name: !name ? 'Name is required' : null,
                    email: !email ? 'Email is required' : null,
                    username: !username ? 'Username is required' : null
                }
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if username or email already exists for other users
        const existingUser = await User.findOne({
            $or: [{ username }, { email }],
            _id: { $ne: req.params.id }  // Exclude current user from check
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'Username or email already exists',
                details: {
                    username: existingUser.username === username ? 'Username already taken' : null,
                    email: existingUser.email === email ? 'Email already registered' : null
                }
            });
        }

        // Prepare update object
        const update = { name, email, username };

        // Only hash and update password if provided
        if (password) {
            update.password = await bcrypt.hash(password, 10);
        }

        // Update admin
        const admin = await User.findOneAndUpdate(
            { _id: req.params.id, type: 'admin' },
            update,
            { new: true }
        ).select('-password');  // Exclude password from response

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        console.log('Admin updated successfully:', admin);
        res.json({
            message: 'Admin updated successfully',
            admin
        });
    } catch (err) {
        console.error('Error in updateAdmin:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};

// Delete admin (not self)
exports.deleteAdmin = async (req, res) => {
    try {
        if (req.user.userId === req.params.id) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }
        const admin = await User.findOneAndDelete({ _id: req.params.id, type: 'admin' });
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        res.json({ message: 'Admin deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// View all admins (paginated)
exports.getAdmins = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [admins, total] = await Promise.all([
            User.find({ type: 'admin' }).skip(skip).limit(limit).select('-password'),
            User.countDocuments({ type: 'admin' })
        ]);
        res.json({
            data: admins,
            page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// View all users (paginated)
exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find({ type: 'user' }).skip(skip).limit(limit).select('-password'),
            User.countDocuments({ type: 'user' })
        ]);
        res.json({
            data: users,
            page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

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