import React, { useState } from 'react';
import styles from './CategoryTree.module.css';

const CategoryTree = ({
    categories,
    level = 0,
    onAdd,
    onEdit,
    onDelete,
    isAdmin
}) => {
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    const toggleExpand = (categoryId) => {
        setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const renderCategory = (category) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedCategories.has(category._id);

        return (
            <div key={category._id} className={styles.treeNode}>
                <div className={styles.nodeContent}>
                    {hasChildren && (
                        <button
                            className={styles.expandButton}
                            onClick={() => toggleExpand(category._id)}
                        >
                            {isExpanded ? '−' : '+'}
                        </button>
                    )}
                    <span className={`${styles.categoryName} ${styles[`level${level}`]}`}>
                        {category.name}
                    </span>
                    {isAdmin && (
                        <div className={styles.actions}>
                            {level < 2 && (
                                <button
                                    className={`${styles.actionButton} ${styles.addButton}`}
                                    onClick={() => onAdd(category._id)}
                                    title="Add subcategory"
                                >
                                    Add
                                </button>
                            )}
                            <button
                                className={`${styles.actionButton} ${styles.editButton}`}
                                onClick={() => onEdit(category)}
                                title="Edit category"
                            >
                                Edit
                            </button>
                            <button
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                onClick={() => onDelete(category._id)}
                                title="Delete category"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
                {hasChildren && isExpanded && (
                    <div>
                        {category.children.map((child) => (
                            <CategoryTree
                                key={child._id}
                                categories={[child]}
                                level={level + 1}
                                onAdd={onAdd}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return <div>{categories.map(renderCategory)}</div>;
};

export default CategoryTree; 