const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs').promises;
const path = require('path');

// Create product
exports.createProduct = async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        console.log('Received files:', req.files);
        console.log('Received file:', req.file);

        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User ID not found in token' });
        }

        const { name, description, price, category } = req.body;

        // Log received data
        console.log('Parsed data:', {
            name,
            description,
            price,
            category,
            userId
        });

        // Validate required fields
        const missingFields = {};
        if (!name) missingFields.name = 'Name is required';
        if (!description) missingFields.description = 'Description is required';
        if (!price) missingFields.price = 'Price is required';
        if (!category) missingFields.category = 'Category is required';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: missingFields
            });
        }

        // Validate price
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({
                message: 'Invalid price',
                details: { price: 'Price must be a positive number' }
            });
        }

        // Validate category exists
        let cat;
        try {
            cat = await Category.findById(category);
            if (!cat) {
                return res.status(400).json({
                    message: 'Invalid category',
                    details: { category: 'The selected category does not exist' }
                });
            }
        } catch (err) {
            return res.status(400).json({
                message: 'Invalid category ID format',
                details: { category: 'The category ID provided is not valid' }
            });
        }

        let imageUrl = null;

        // Handle image upload if file is present
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
            console.log('Image URL:', imageUrl);
        } else {
            return res.status(400).json({
                message: 'Missing image',
                details: { image: 'An image is required' }
            });
        }

        const product = new Product({
            name: name.trim(),
            description: description.trim(),
            price: numericPrice,
            category,
            user: userId,
            imageUrl
        });

        console.log('Product to save:', product);

        await product.save();

        // Populate category and user details before sending response
        await product.populate('category');
        await product.populate('user', 'username');

        console.log('Product saved successfully:', product);
        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (err) {
        // If there was an error and a file was uploaded, delete it
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        console.error('Error in createProduct:', err);
        res.status(500).json({
            message: 'Failed to create product',
            error: err.message
        });
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

// Get product by id
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category').populate('user', 'username');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error('Error in getProductById:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update product (only owner or admin)
exports.updateProduct = async (req, res) => {
    try {
        console.log('Update product data:', req.body);
        console.log('Update file:', req.file);

        // Use pre-checked product from middleware if available
        const product = req.product || await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const { name, description, price, category } = req.body;

        if (category) {
            const cat = await Category.findById(category);
            if (!cat) {
                return res.status(400).json({ message: 'Invalid category' });
            }
        }

        // Handle image update if new file is uploaded
        if (req.file) {
            // Delete old image if exists
            if (product.imageUrl) {
                const oldImagePath = path.join(__dirname, '../../', product.imageUrl);
                try {
                    await fs.unlink(oldImagePath);
                } catch (unlinkError) {
                    console.error('Error deleting old image:', unlinkError);
                }
            }
            // Set new image URL
            product.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Update fields if provided
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = Number(price);
        if (category) product.category = category;

        await product.save();

        // Populate category before sending response
        await product.populate('category');
        await product.populate('user', 'username');

        console.log('Product updated:', product);
        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (err) {
        // If there was an error and a file was uploaded, delete it
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        console.error('Error in updateProduct:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Delete product (only owner or admin)
exports.deleteProduct = async (req, res) => {
    try {
        // Use pre-checked product from middleware if available
        const product = req.product || await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete image file if exists
        if (product.imageUrl) {
            const imagePath = path.join(__dirname, '../../', product.imageUrl);
            try {
                await fs.unlink(imagePath);
            } catch (unlinkError) {
                console.error('Error deleting image:', unlinkError);
            }
        }

        await product.deleteOne();
        res.json({
            message: 'Product deleted successfully',
            productId: product._id
        });
    } catch (err) {
        console.error('Error in deleteProduct:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get user's products
exports.getUserProducts = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User ID not found in token' });
        }

        console.log('Getting products for user:', userId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find({ user: userId })
                .populate('category')
                .populate('user', 'username')
                .skip(skip)
                .limit(limit),
            Product.countDocuments({ user: userId })
        ]);

        console.log('Found products:', products);
        res.json({
            data: products,
            page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        console.error('Error in getUserProducts:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}; 