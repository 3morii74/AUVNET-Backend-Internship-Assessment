import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../services/categoryService';
import CategoryModal from '../components/CategoryModal';
import styles from './CategoriesPage.module.css';

const CategoriesPage = () => {
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Helper function to check if user is an admin or super admin
    const isAdminUser = user?.type === 'admin' || user?.type === 'super_admin';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await getCategories();
            console.log('API Response:', data); // Debug log
            // Ensure we're setting an array
            const categoriesArray = Array.isArray(data) ? data : [];
            console.log('Categories Array:', categoriesArray); // Debug log
            setCategories(categoriesArray);
            setError(null);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.response?.data?.message || 'Failed to fetch categories');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedCategory(null);
        setModalOpen(true);
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setModalOpen(true);
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(categoryId);
                await fetchCategories();
            } catch (err) {
                console.error('Error deleting category:', err);
                setError(err.response?.data?.message || 'Failed to delete category');
            }
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (selectedCategory) {
                await updateCategory(selectedCategory._id, formData);
            } else {
                const result = await createCategory(formData);
                console.log('Created category:', result); // Debug log
            }
            setModalOpen(false);
            await fetchCategories();
        } catch (err) {
            console.error('Error submitting category:', err);
            setError(
                err.response?.data?.message ||
                `Failed to ${selectedCategory ? 'update' : 'create'} category`
            );
        }
    };

    const renderCategoryTree = (parentId = null, level = 0) => {
        console.log('Rendering tree for parent:', parentId, 'Categories:', categories); // Debug log
        const filteredCategories = categories.filter(
            (category) => category.parent === parentId
        );
        console.log('Filtered categories:', filteredCategories); // Debug log

        if (filteredCategories.length === 0) {
            return null;
        }

        return (
            <ul className={`${styles.categoryList} ${level > 0 ? styles.nested : ''}`}>
                {filteredCategories.map((category) => (
                    <li key={category._id} className={styles.categoryItem}>
                        <div className={styles.categoryContent}>
                            <span className={styles.categoryName}>
                                {category.name}
                            </span>
                            {isAdminUser && (
                                <div className={styles.categoryActions}>
                                    <button
                                        className={styles.editButton}
                                        onClick={() => handleEdit(category)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => handleDelete(category._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                        {renderCategoryTree(category._id, level + 1)}
                    </li>
                ))}
            </ul>
        );
    };

    if (loading) {
        return <div className={styles.loading}>Loading categories...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Categories</h1>
                {isAdminUser && (
                    <button className={styles.addButton} onClick={handleAdd}>
                        Add Root Category
                    </button>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {categories.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No categories found. {isAdminUser && 'Add one to get started!'}</p>
                </div>
            ) : (
                renderCategoryTree()
            )}

            {modalOpen && (
                <CategoryModal
                    category={selectedCategory}
                    categories={categories}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
};

export default CategoriesPage; 