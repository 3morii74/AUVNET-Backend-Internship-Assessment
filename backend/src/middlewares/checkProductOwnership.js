const Product = require('../models/Product');

const checkProductOwnership = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const userId = req.user.userId;

        // Skip check for admins
        if (req.user.type === 'admin') {
            return next();
        }

        const product = await Product.findById(productId);

        // Product not found
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user owns the product
        if (product.user.toString() !== userId) {
            return res.status(403).json({
                message: 'Forbidden: You can only modify your own products'
            });
        }

        // Store product in request for later use
        req.product = product;
        next();
    } catch (err) {
        console.error('Error in checkProductOwnership:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = checkProductOwnership; 