const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { ValidationError } = require('../utils/errors');

class AdminService {
    async validateAdminData(adminData, isUpdate = false) {
        const { username, email, password, name } = adminData;

        // Validate required fields
        if (!username || !email || (!isUpdate && !password) || !name) {
            throw new ValidationError('Missing required fields', {
                username: !username ? 'Username is required' : null,
                email: !email ? 'Email is required' : null,
                password: (!isUpdate && !password) ? 'Password is required' : null,
                name: !name ? 'Name is required' : null
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ValidationError('Invalid email format');
        }

        return true;
    }

    async checkExistingUser(username, email, excludeId = null) {
        const query = {
            $or: [{ username }, { email }]
        };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existingUser = await User.findOne(query);
        if (existingUser) {
            throw new ValidationError('Username or email already exists', {
                username: existingUser.username === username ? 'Username already taken' : null,
                email: existingUser.email === email ? 'Email already registered' : null
            });
        }
    }

    async createAdmin(adminData) {
        await this.validateAdminData(adminData);
        await this.checkExistingUser(adminData.username, adminData.email);

        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        const admin = new User({
            ...adminData,
            password: hashedPassword,
            type: 'admin'
        });

        await admin.save();
        const adminResponse = admin.toObject();
        delete adminResponse.password;

        return adminResponse;
    }

    async updateAdmin(adminId, currentUserId, updateData) {
        if (adminId === currentUserId) {
            throw new ValidationError('Cannot update yourself here');
        }

        // Check if target user is a super admin
        const targetAdmin = await User.findById(adminId);
        if (targetAdmin && targetAdmin.type === 'super_admin') {
            throw new ValidationError('Cannot modify super admin account');
        }

        await this.validateAdminData(updateData, true);
        await this.checkExistingUser(updateData.username, updateData.email, adminId);

        const update = { ...updateData };
        if (update.password) {
            update.password = await bcrypt.hash(update.password, 10);
        }

        const admin = await User.findOneAndUpdate(
            { _id: adminId, type: 'admin' },
            update,
            { new: true }
        ).select('-password');

        if (!admin) {
            throw new ValidationError('Admin not found');
        }

        return admin;
    }

    async deleteAdmin(adminId, currentUserId) {
        if (adminId === currentUserId) {
            throw new ValidationError('Cannot delete yourself');
        }

        // Check if target user is a super admin
        const targetAdmin = await User.findById(adminId);
        if (targetAdmin && targetAdmin.type === 'super_admin') {
            throw new ValidationError('Cannot delete super admin account');
        }

        const admin = await User.findOneAndDelete({ _id: adminId, type: 'admin' });
        if (!admin) {
            throw new ValidationError('Admin not found');
        }

        return admin;
    }

    async getAdmins(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [admins, total] = await Promise.all([
            User.find({ type: 'admin' }).skip(skip).limit(limit).select('-password'),
            User.countDocuments({ type: 'admin' })
        ]);

        return {
            data: admins,
            page,
            totalPages: Math.ceil(total / limit),
            total
        };
    }

    async getUsers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find({ type: 'user' }).skip(skip).limit(limit).select('-password'),
            User.countDocuments({ type: 'user' })
        ]);

        return {
            data: users,
            page,
            totalPages: Math.ceil(total / limit),
            total
        };
    }
}

module.exports = new AdminService(); 