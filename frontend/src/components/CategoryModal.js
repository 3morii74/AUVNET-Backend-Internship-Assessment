import React, { useState, useEffect } from 'react';
import styles from './CategoryModal.module.css';

const CategoryModal = ({ category, categories, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        parent: '',
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                parent: category.parent || '',
            });
        }
    }, [category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            parent: formData.parent || null, // Convert empty string to null for root categories
        });
    };

    // Filter out the current category and its children from parent options
    const getValidParentOptions = () => {
        if (!category) return categories;

        const isChildCategory = (parentId, targetId) => {
            const parent = categories.find((cat) => cat._id === parentId);
            if (!parent) return false;
            if (parent._id === targetId) return true;
            return isChildCategory(parent.parent, targetId);
        };

        return categories.filter(
            (cat) => cat._id !== category._id && !isChildCategory(cat.parent, category._id)
        );
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>
                    {category ? 'Edit Category' : 'Add Category'}
                </h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter category name"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="parent">Parent Category:</label>
                        <select
                            id="parent"
                            name="parent"
                            value={formData.parent}
                            onChange={handleChange}
                        >
                            <option value="">None (Root Category)</option>
                            {getValidParentOptions().map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            {category ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal; 