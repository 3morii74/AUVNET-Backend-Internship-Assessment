import axios from 'axios';
import api from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios to include the token in requests
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to handle errors
const handleError = (error, operation) => {
    console.error(`Error in ${operation}:`, error);
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    throw new Error(errorMessage);
};

// General Product Operations
export const getProducts = async () => {
    try {
        const response = await api.get('/products');
        console.log('Get products response:', response);
        return response.data;
    } catch (error) {
        handleError(error, 'getProducts');
    }
};

export const getProductById = async (productId) => {
    try {
        const response = await api.get(`/products/${productId}`);
        console.log('Get product by ID response:', response);
        return response.data;
    } catch (error) {
        handleError(error, 'getProductById');
    }
};

// User Product Operations
export const getUserProducts = async () => {
    try {
        const response = await api.get('/products/user');
        console.log('Get user products response:', response);
        return response.data;
    } catch (error) {
        handleError(error, 'getUserProducts');
    }
};

export const createProduct = async (formData) => {
    try {
        console.log('Creating product with FormData:', formData);
        const response = await api.post('/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Create product response:', response);
        return response.data;
    } catch (error) {
        handleError(error, 'createProduct');
    }
};

export const updateProduct = async (productId, formData) => {
    try {
        console.log('Updating product with FormData:', formData);
        const response = await api.put(`/products/${productId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Update product response:', response);
        return response.data.product; // Return the updated product from the new response format
    } catch (error) {
        handleError(error, 'updateProduct');
    }
};

export const deleteProduct = async (productId) => {
    try {
        const response = await api.delete(`/products/${productId}`);
        console.log('Delete product response:', response);
        return response.data; // Returns { message, productId }
    } catch (error) {
        handleError(error, 'deleteProduct');
    }
};

// Admin Product Operations
export const getAllProducts = async () => {
    try {
        const response = await api.get('/admin/products');
        console.log('Get all products response:', response);
        return response.data;
    } catch (error) {
        handleError(error, 'getAllProducts');
    }
};

export const adminDeleteProduct = async (productId) => {
    try {
        console.log('Admin deleting product:', productId);
        const response = await api.delete(`/products/admin/${productId}`);
        console.log('Admin delete product response:', response);
        return response.data;
    } catch (error) {
        handleError(error, 'adminDeleteProduct');
    }
};

// Wishlist Operations
export const addToWishlist = async (productId) => {
    try {
        const response = await api.post('/wishlist', { productId });
        console.log('Add to wishlist response:', response);
        return response.data;
    } catch (error) {
        handleError(error, 'addToWishlist');
    }
};

export const removeFromWishlist = async (productId) => {
    try {
        const response = await api.delete(`/wishlist/${productId}`);
        console.log('Remove from wishlist response:', response);
        return response.data;
    } catch (error) {
        handleError(error, 'removeFromWishlist');
    }
}; 