import axios from 'axios';
import api from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getWishlist = async () => {
    try {
        const response = await api.get('/wishlist');
        console.log('Get wishlist response:', response);
        return response.data;
    } catch (error) {
        console.error('Error in getWishlist:', error.response?.data || error.message);
        throw error;
    }
};

export const addToWishlist = async (productId) => {
    try {
        const response = await api.post('/wishlist', { productId });
        console.log('Add to wishlist response:', response);
        return response.data;
    } catch (error) {
        console.error('Error in addToWishlist:', error.response?.data || error.message);
        throw error;
    }
};

export const removeFromWishlist = async (productId) => {
    try {
        const response = await api.delete(`/wishlist/${productId}`);
        console.log('Remove from wishlist response:', response);
        return response.data;
    } catch (error) {
        console.error('Error in removeFromWishlist:', error.response?.data || error.message);
        throw error;
    }
}; 