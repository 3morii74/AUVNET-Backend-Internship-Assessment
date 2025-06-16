const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if already in wishlist
        const existingItem = await Wishlist.findOne({
            user: req.user.userId,
            product: productId
        });

        if (existingItem) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        const wishlistItem = new Wishlist({
            user: req.user.userId,
            product: productId
        });

        await wishlistItem.save();

        // Populate the product details before sending response
        const populatedItem = await Wishlist.findById(wishlistItem._id)
            .populate({
                path: 'product',
                populate: { path: 'category' }
            });

        res.status(201).json(populatedItem);
    } catch (err) {
        console.error('Error in addToWishlist:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// View wishlist (paginated)
exports.getWishlist = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get wishlist items with populated product details
        const [items, total] = await Promise.all([
            Wishlist.find({ user: req.user.userId })
                .populate({
                    path: 'product',
                    populate: { path: 'category' }
                })
                .skip(skip)
                .limit(limit),
            Wishlist.countDocuments({ user: req.user.userId })
        ]);

        // Filter out items where product is null (deleted products)
        const validItems = items.filter(item => item.product !== null);

        // Clean up wishlist by removing items with deleted products
        const invalidItems = items.filter(item => item.product === null);
        if (invalidItems.length > 0) {
            await Wishlist.deleteMany({
                _id: { $in: invalidItems.map(item => item._id) }
            });
            console.log(`Cleaned up ${invalidItems.length} wishlist items with deleted products`);
        }

        // Transform the data to match frontend expectations
        const wishlistItems = validItems.map(item => ({
            _id: item.product._id,
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            category: item.product.category,
            imageUrl: item.product.imageUrl,
            addedAt: item.createdAt
        }));

        res.json({
            wishlist: wishlistItems,
            page,
            totalPages: Math.ceil(total / limit),
            total: validItems.length
        });
    } catch (err) {
        console.error('Error in getWishlist:', err);
        res.status(500).json({
            message: 'Failed to fetch wishlist',
            error: err.message
        });
    }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const result = await Wishlist.findOneAndDelete({
            user: req.user.userId,
            product: productId
        });

        if (!result) {
            return res.status(404).json({ message: 'Wishlist item not found' });
        }

        res.json({ message: 'Removed from wishlist' });
    } catch (err) {
        console.error('Error in removeFromWishlist:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}; 