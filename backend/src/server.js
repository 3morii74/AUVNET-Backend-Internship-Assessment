const mongoose = require('mongoose');
const app = require('./app');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    process.exit(1);
});

console.log('Starting server...');
console.log('Port:', PORT);
console.log('MongoDB URI:', MONGO_URI ? 'URI is set' : 'URI is missing');

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        logger.info('Connected to MongoDB');

        // Check for existing admin or user with username 'admin'
        return User.findOne({ $or: [{ type: 'admin' }, { username: 'admin' }] });
    })
    .then(async (existingUser) => {
        if (!existingUser) {
            // Create new super admin user if none exists
            const hashedPassword = await bcrypt.hash('admin', 10);
            const superAdmin = new User({
                username: 'admin',
                name: 'admin',
                email: 'super_admin@example.com',
                password: hashedPassword,
                type: 'super_admin'
            });
            await superAdmin.save();
            logger.info('Super admin user created');
        } else if (existingUser.type !== 'super_admin') {
            // Update existing user to be super admin if needed
            existingUser.type = 'super_admin';
            await existingUser.save();
            logger.info('Existing user updated to super admin');
        }
    })
    .catch((err) => {
        logger.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Start the server
app.listen(PORT, () => {
    logger.info(`API available at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    process.exit(1);
});