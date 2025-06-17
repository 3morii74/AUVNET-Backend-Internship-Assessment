const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs').promises;
const path = require('path');
const productService = require('../services/productService');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Create product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        if (!name || !description || !price || !category) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        if (isNaN(price) || Number(price) <= 0) {
            return res.status(400).json({ message: 'Price must be a positive number.' });
        }
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        const product = new Product({
            name,
            description,
            price: Number(price),
            category,
            imageUrl,
            user: req.user.userId,
        });
        await product.save();
        res.status(201).json({ message: 'Product created', product });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get all products (paginated)
exports.getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product.find().populate('category').populate('user', 'username').skip(skip).limit(limit),
            Product.countDocuments()
        ]);
        res.json({
            data: products,
            page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        console.error('Error in getProducts:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get single product
exports.getProduct = asyncHandler(async (req, res) => {
    const product = await productService.getProduct(req.params.id);
    res.json(product);
});

// Update product
exports.updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.user.userId, req.body, req.file);
    res.json({
        message: 'Product updated successfully',
        product
    });
});

// Delete product
exports.deleteProduct = asyncHandler(async (req, res) => {
    const isAdmin = req.user.type === 'admin';
    await productService.deleteProduct(req.params.id, req.user.userId, isAdmin);
    res.json({
        message: 'Product deleted successfully',
        productId: req.params.id
    });
});

// Get user's products
exports.getUserProducts = asyncHandler(async (req, res) => {
    logger.info('Received request for getUserProducts');
    logger.info('User ID:', req.user.userId);
    logger.info('Query params:', req.query);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    logger.info(`Fetching user products - userId: ${req.user.userId}, page: ${page}, limit: ${limit}`);
    const result = await productService.getUserProducts(req.user.userId, page, limit);
    logger.info('User products fetched successfully:', {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        count: result.data.length
    });
    res.json(result);
}); 