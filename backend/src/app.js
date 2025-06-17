const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const wishlistRoutes = require('./routes/wishlist');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();

// Add request logging in development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

try {
    console.log('Initializing middleware...');
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Serve static files from uploads directory
    console.log('Setting up static file serving...');
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Initialize routes
    console.log('Initializing routes...');
    app.use('/api/auth', authRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/wishlist', wishlistRoutes);
    app.use('/api/admin', adminRoutes);

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ message: 'Route not found' });
    });

    // Error handling middleware
    app.use(errorHandler);

    console.log('App initialization completed successfully');
} catch (err) {
    console.error('Error during app initialization:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    throw err; // Re-throw to be caught by global error handler
}

module.exports = app; 