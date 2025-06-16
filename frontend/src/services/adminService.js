import api from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
        console.log('Creating admin with data:', adminData);
        const response = await api.post('/admin/admins', adminData);
        console.log('Create admin response:', response);
        return response.data;
    } catch (error) {
        console.error('Error in createAdmin:', error.response?.data || error.message);
        throw error;
    }
};

export const updateAdmin = async (adminId, adminData) => {
    try {
        console.log('Updating admin with data:', adminData);
        const response = await api.put(`/admin/admins/${adminId}`, adminData);
        console.log('Update admin response:', response);
        return response.data;
    } catch (error) {
        console.error('Error in updateAdmin:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteAdmin = async (adminId) => {
    try {
        const response = await api.delete(`/admin/admins/${adminId}`);
        console.log('Delete admin response:', response);
        return response.data;
    } catch (error) {
        console.error('Error in deleteAdmin:', error.response?.data || error.message);
        throw error;
    }
}; 