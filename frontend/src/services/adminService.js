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
    try {
        const response = await api.delete(`/admin/users/${userId}`);
        console.log('Delete user response:', response);
        return response.data;
    } catch (error) {
        console.error('Error in deleteUser:', error.response?.data || error.message);
        throw error;
    }
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
    try {
        const response = await api.post('/admin/add-admin', adminData);
        return response.data;
    } catch (error) {
        console.error('Error creating admin:', error);
        throw error;
    }
};

export const updateAdmin = async (adminId, adminData) => {
    try {
        const response = await api.put(`/admin/update-admin/${adminId}`, adminData);
        return response.data;
    } catch (error) {
        console.error('Error updating admin:', error);
        throw error;
    }
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
export const getAllUsers = async (page = 1, limit = 4) => {
    try {
        const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Get all admins (paginated)
export const getAllAdmins = async (page = 1, limit = 4) => {
    try {
        const response = await api.get(`/admin/admins?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching admins:', error);
        throw error;
    }
};

export const makeAdmin = async (userId) => {
    try {
        const response = await api.post(`/admin/make-admin/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error making admin:', error);
        throw error;
    }
};

export const removeAdmin = async (userId) => {
    try {
        const response = await api.post(`/admin/remove-admin/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing admin:', error);
        throw error;
    }
}; 