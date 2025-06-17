const Product = require('../models/Product');
const { ValidationError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

class ProductService {
    async validateProductData(productData) {
        const { name, description, price, category } = productData;

        if (!name || !description || !price || !category) {
            throw new ValidationError('Missing required fields', {
                name: !name ? 'Name is required' : null,
                description: !description ? 'Description is required' : null,
                price: !price ? 'Price is required' : null,
                category: !category ? 'Category is required' : null
            });
        }

        if (typeof price !== 'number' || price <= 0) {
            throw new ValidationError('Invalid price', {
                price: 'Price must be a positive number'
            });
        }

        return true;
    }

    async createProduct(userId, productData, imageFile) {
        // Debug logging
        console.log('Raw product data:', productData);
        console.log('Raw price value:', productData.price);
        console.log('Price type:', typeof productData.price);

        // Convert price to number before validation
        const data = {
            ...productData,
            price: Number(productData.price)
        };

        // Debug logging after conversion
        console.log('Converted price value:', data.price);
        console.log('Converted price type:', typeof data.price);

        await this.validateProductData(data);

        let imageUrl = null;
        if (imageFile) {
            imageUrl = `/uploads/${imageFile.filename}`;
        }

        const product = new Product({
            ...data,
            user: userId,
            imageUrl
        });

        await product.save();
        await product.populate('category');
        await product.populate('user', 'username');

        logger.info(`Product created: ${product._id}`);
        return product;
    }

    async updateProduct(productId, userId, updateData, imageFile) {
        if (Object.keys(updateData).length === 0 && !imageFile) {
            throw new ValidationError('No update data provided');
        }

        // If price is being updated, validate it
        if (updateData.price) {
            const price = Number(updateData.price);
            if (isNaN(price) || price <= 0) {
                throw new ValidationError('Invalid price', {
                    price: 'Price must be a positive number'
                });
            }
            updateData.price = price;
        }

        // Add image URL if new image is uploaded
        if (imageFile) {
            updateData.imageUrl = `/uploads/${imageFile.filename}`;
        }

        const product = await Product.findOneAndUpdate(
            { _id: productId, user: userId },
            updateData,
            { new: true }
        )
            .populate('category')
            .populate('user', 'username');

        if (!product) {
            throw new NotFoundError('Product not found or you do not have permission to update it');
        }

        logger.info(`Product updated: ${productId}`);
        return product;
    }

    async deleteProduct(productId, userId, isAdmin = false) {
        // If user is admin, they can delete any product
        const query = isAdmin ? { _id: productId } : { _id: productId, user: userId };

        const product = await Product.findOneAndDelete(query);

        if (!product) {
            throw new NotFoundError('Product not found or you do not have permission to delete it');
        }

        logger.info(`Product deleted: ${productId}`);
        return product;
    }

    async getProduct(productId) {
        const product = await Product.findById(productId)
            .populate('category')
            .populate('user', 'username');

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        return product;
    }

    async getAllProducts(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const query = { ...filters };

        // Add price range filter if provided
        if (filters.minPrice || filters.maxPrice) {
            query.price = {};
            if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
            if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
            delete query.minPrice;
            delete query.maxPrice;
        }

        // Add category filter if provided
        if (filters.category) {
            query.category = filters.category;
        }

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('category')
                .populate('user', 'username')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Product.countDocuments(query)
        ]);

        return {
            data: products,
            page,
            totalPages: Math.ceil(total / limit),
            total
        };
    }

    async getUserProducts(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product.find({ user: userId })
                .populate('category')
                .populate('user', 'username')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Product.countDocuments({ user: userId })
        ]);

        return {
            data: products,
            page,
            totalPages: Math.ceil(total / limit),
            total
        };
    }
}

module.exports = new ProductService(); 