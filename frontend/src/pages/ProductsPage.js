import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    getProducts,
    getUserProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    adminDeleteProduct
} from '../services/productService';
import { getCategories } from '../services/categoryService';
import { addToWishlist, removeFromWishlist } from '../services/wishlistService';
import ProductModal from '../components/ProductModal';
import Pagination from '../components/Pagination';
import styles from './ProductsPage.module.css';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

const ProductsPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showUserProducts, setShowUserProducts] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(4); // Set limit to 4 products per page

    useEffect(() => {
        fetchData();
    }, [showUserProducts, currentPage]); // Add currentPage to dependencies

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [productsResponse, categoriesData] = await Promise.all([
                showUserProducts ? getUserProducts(currentPage, limit) : getProducts(currentPage, limit),
                getCategories()
            ]);

            // Ensure products is always an array and add ownership flag
            const productsWithOwnership = Array.isArray(productsResponse?.data)
                ? productsResponse.data.map(product => ({
                    ...product,
                    isOwner: user && (user.type === 'admin' || user.id === product.user._id)
                }))
                : [];

            setProducts(productsWithOwnership);
            setTotalPages(productsResponse.totalPages || 1);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);

            console.log('Current user:', user);
            console.log('Products with ownership:', productsWithOwnership);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to fetch data');
            setProducts([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0); // Scroll to top when changing page
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setModalOpen(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setModalOpen(true);
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                // Always use deleteProduct for both admin and regular users
                await deleteProduct(productId);
                await fetchData();
            } catch (err) {
                console.error('Error deleting product:', err);
                setError(err.response?.data?.message || 'Failed to delete product');
            }
        }
    };

    const handleWishlist = async (productId, isInWishlist) => {
        try {
            if (isInWishlist) {
                await removeFromWishlist(productId);
            } else {
                await addToWishlist(productId);
            }
            await fetchData();
        } catch (err) {
            console.error('Error updating wishlist:', err);
            setError(err.response?.data?.message || 'Failed to update wishlist');
        }
    };

    const handleSubmit = async (formData) => {
        try {
            setError(null);

            // Log the received form data
            console.log('Received form data:', formData);

            // Log form entries to verify data
            console.log('Form entries:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            if (selectedProduct) {
                await updateProduct(selectedProduct._id, formData);
            } else {
                await createProduct(formData);
            }
            setModalOpen(false);
            await fetchData();
        } catch (err) {
            console.error('Error submitting product:', err);
            console.error('Error details:', err.response?.data);
            setError(
                err.response?.data?.message ||
                `Failed to ${selectedProduct ? 'update' : 'create'} product`
            );
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
    };

    useEffect(() => { getCategories().then(setCategories); }, []);

    if (loading) {
        return <div className={styles.loading}>Loading products...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Products</h1>
                    {user && user.type === 'user' && (
                        <button
                            className={styles.filterButton}
                            onClick={() => {
                                setShowUserProducts(!showUserProducts);
                                setCurrentPage(1); // Reset to first page when switching views
                            }}
                        >
                            {showUserProducts ? 'Show All Products' : 'Show My Products'}
                        </button>
                    )}
                </div>
                {/* Only show Add Product button for regular users */}
                {user && user.type === 'user' && (
                    <button className={styles.addButton} onClick={handleAdd}>
                        Add Product
                    </button>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {products.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No products found.</p>
                    {user && user.type === 'user' && (
                        <p>
                            {showUserProducts
                                ? "You haven't created any products yet."
                                : 'Be the first to add a product!'}
                        </p>
                    )}
                </div>
            ) : (
                <>
                    <div className={styles.grid}>
                        {products.map((product) => (
                            <div key={product._id} className={styles.card}>
                                {/* Only show "My Product" badge for regular users who own the product */}
                                {product.isOwner && user.type !== 'admin' && (
                                    <div className={styles.userProductBadge}>My Product</div>
                                )}
                                <div
                                    className={styles.cardContent}
                                    onClick={() => handleProductClick(product._id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img
                                        src={product.imageUrl ? `http://localhost:4000${product.imageUrl}` : 'https://via.placeholder.com/300'}
                                        alt={product.name}
                                        className={styles.cardImage}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300';
                                        }}
                                    />
                                    <div className={styles.cardInfo}>
                                        <h2 className={styles.cardTitle}>{product.name}</h2>
                                        <p className={styles.cardPrice}>${product.price}</p>
                                        {product.category && (
                                            <p className={styles.cardCategory}>
                                                {product.category.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.cardActions}>
                                    {/* Show delete button for admin and super_admin users */}
                                    {user && (user.type === 'admin' || user.type === 'super_admin') && (
                                        <button
                                            className={`${styles.deleteButton} ${styles.adminAction}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(product._id);
                                            }}
                                        >
                                            Delete Product
                                        </button>
                                    )}

                                    {/* Show wishlist button only for regular users */}
                                    {user && user.type === 'user' && (
                                        <button
                                            className={styles.wishlistButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleWishlist(
                                                    product._id,
                                                    product.isInWishlist
                                                );
                                            }}
                                        >
                                            {product.isInWishlist
                                                ? '❤️ Remove from Wishlist'
                                                : '🤍 Add to Wishlist'}
                                        </button>
                                    )}

                                    {/* Show edit/delete buttons for product owners */}
                                    {product.isOwner && user.type === 'user' && (
                                        <div className={styles.ownerActions}>
                                            <button
                                                className={styles.editButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(product);
                                                }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(product._id);
                                                }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}

            {modalOpen && (
                <ProductModal
                    product={selectedProduct}
                    categories={categories}
                    onSubmit={handleSubmit}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ProductsPage; 