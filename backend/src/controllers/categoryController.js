const Category = require('../models/Category');

// Create category (admin only)
exports.createCategory = async (req, res) => {
    try {
        if (req.user.type !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        const { name, parent } = req.body;
        const category = new Category({ name, parent: parent || null });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get all categories (flat, paginated)
exports.getCategories = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get category by id
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
    try {
        if (req.user.type !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        const { name, parent } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, parent: parent || null },
            { new: true }
        );
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
    try {
        if (req.user.type !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Helper: build category tree recursively
async function buildTree(parent = null) {
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
}

// Get category tree (nested)
exports.getCategoryTree = async (req, res) => {
    try {
        const tree = await buildTree();
        res.json(tree);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}; 