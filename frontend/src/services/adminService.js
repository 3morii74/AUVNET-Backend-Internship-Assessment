import api from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// User Management
export const getUsers = async () => {
    try {
        const response = await api.get('/admin/users');
        console.log('Get users response:', response);
        return response.data;
    } catch (error) {
        console.error('Error in getUsers:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
};

// Admin Management
export const getAdmins = async () => {
    try {
        const response = await api.get('/admin/admins');
        console.log('Get admins response:', response);
        return response.data;
    } catch (error) {
        console.error('Error in getAdmins:', error.response?.data || error.message);
        throw error;
    }
};

export const createAdmin = async (adminData) => {
    const response = await api.post('/admin/admins', adminData);
    return response.data;
};

export const updateAdmin = async (adminId, adminData) => {
    const response = await api.put(`/admin/admins/${adminId}`, adminData);
    return response.data;
};

export const deleteAdmin = async (adminId) => {
    try {
        const response = await api.delete(`/admin/delete-admin/${adminId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting admin:', error);
        throw error;
    }
};

// Get all users (paginated)
export const getAllUsers = async (page = 1, limit = 10) => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
};

// Get all admins (paginated)
export const getAllAdmins = async (page = 1, limit = 10) => {
    const response = await api.get(`/admin/admins?page=${page}&limit=${limit}`);
    return response.data;
};

export const removeAdmin = async (adminId) => {
    const response = await api.delete(`/admin/admins/${adminId}`);
    return response.data;
}; 