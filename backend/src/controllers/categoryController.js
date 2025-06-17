const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

// Helper: Calculate category depth
const getCategoryDepth = async (categoryId) => {
    let depth = 0;
    let currentCategory = await Category.findById(categoryId);

    while (currentCategory && currentCategory.parent) {
        depth++;
        currentCategory = await Category.findById(currentCategory.parent);
    }

    return depth;
};

// Create category (admin only)
exports.createCategory = asyncHandler(async (req, res) => {
        if (req.user.type !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        const { name, parent } = req.body;

        // Check category depth if parent is provided
        if (parent) {
            const parentDepth = await getCategoryDepth(parent);
            if (parentDepth >= 2) { // Since we're adding a new level, check if parent is already at depth 2
                return res.status(400).json({
                    message: 'Maximum category depth exceeded',
                    details: 'Categories can only have a maximum depth of 3 levels'
                });
            }
        }

        const category = new Category({ name, parent: parent || null });
        await category.save();
        res.status(201).json(category);
});

// Get all categories (flat, paginated)
exports.getCategories = asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [categories, total] = await Promise.all([
            Category.find().skip(skip).limit(limit),
            Category.countDocuments()
        ]);
        res.json({
            data: categories,
            page,
            totalPages: Math.ceil(total / limit),
            total
        });
});

// Get category by id
exports.getCategoryById = asyncHandler(async (req, res) => {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
});

// Update category (admin only)
exports.updateCategory = asyncHandler(async (req, res) => {
        if (req.user.type !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        const { name, parent } = req.body;

        // If parent is being updated, check the new depth
        if (parent) {
            // Prevent circular reference
            if (parent === req.params.id) {
                return res.status(400).json({
                    message: 'Invalid parent',
                    details: 'A category cannot be its own parent'
                });
            }

            // Check if the new parent would exceed maximum depth
            const parentDepth = await getCategoryDepth(parent);

            // Also need to check if this category has children
            const hasChildren = await Category.exists({ parent: req.params.id });

            if (parentDepth >= 2 || (parentDepth === 1 && hasChildren)) {
                return res.status(400).json({
                    message: 'Maximum category depth exceeded',
                    details: 'Categories can only have a maximum depth of 3 levels'
                });
            }
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, parent: parent || null },
            { new: true }
        );
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
});

// Delete category (admin only)
exports.deleteCategory = asyncHandler(async (req, res) => {
        if (req.user.type !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted' });
});

// Helper: build category tree recursively
const buildTree = async (parent = null) => {
    const categories = await Category.find({ parent });
    const tree = await Promise.all(categories.map(async (cat) => {
        const children = await buildTree(cat._id);
        return {
            _id: cat._id,
            name: cat.name,
            parent: cat.parent,
            children
        };
    }));
    return tree;
};

// Get category tree (nested)
exports.getCategoryTree = asyncHandler(async (req, res) => {
        const tree = await buildTree();
        res.json(tree);
});

// Test route to check categories
exports.testCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().lean();
    logger.info('Test route - Total categories in DB:', categories.length);
    logger.info('Sample category:', categories[0]);
    res.json({ count: categories.length, sample: categories[0] });
});

// Test route to create a sample category
exports.createTestCategory = asyncHandler(async (req, res) => {
    const testCategory = new Category({
        name: 'Test Category'
    });
    await testCategory.save();
    logger.info('Test category created:', testCategory);
    res.json(testCategory);
}); 