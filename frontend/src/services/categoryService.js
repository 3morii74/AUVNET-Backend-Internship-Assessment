import api from './api';

export const getCategories = async () => {
    try {
        const response = await api.get('/categories');
        console.log('Categories API response:', response);

        // Handle both paginated and non-paginated responses
        if (response.data?.data) {
            return response.data.data;
        } else if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error('Error in getCategories:', error.response?.data || error.message);
        throw error;
    }
};

export const createCategory = async (categoryData) => {
    try {
        const response = await api.post('/categories', categoryData);
        console.log('Create category response:', response);
        return response.data;
    } catch (error) {
        console.error('Error in createCategory:', error);
        throw error;
    }
};

export const updateCategory = async (categoryId, categoryData) => {
    try {
        const response = await api.put(`/categories/${categoryId}`, categoryData);
        console.log('Update category response:', response);
        return response.data;
    } catch (error) {
        console.error('Error in updateCategory:', error);
        throw error;
    }
};

export const deleteCategory = async (categoryId) => {
    try {
        const response = await api.delete(`/categories/${categoryId}`);
        console.log('Delete category response:', response);
        return response.data;
    } catch (error) {
        console.error('Error in deleteCategory:', error);
        throw error;
    }
}; 