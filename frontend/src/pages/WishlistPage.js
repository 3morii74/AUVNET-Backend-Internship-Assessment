import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../services/wishlistService';
import Pagination from '../components/Pagination';
import styles from './WishlistPage.module.css';

const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchWishlist();
    }, [currentPage]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const data = await getWishlist(currentPage);
            setWishlistItems(data.wishlist);
            setTotalPages(data.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to fetch wishlist');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            await removeFromWishlist(productId);
            await fetchWishlist();
        } catch (err) {
            setError('Failed to remove product from wishlist');
            console.error(err);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>My Wishlist</h1>
                <p className={styles.subtitle}>
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                </p>
            </div>

            {error && (
                <div className={styles.errorBanner}>
                    {error}
                    <button
                        className={styles.dismissButton}
                        onClick={() => setError(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            {wishlistItems.length > 0 ? (
                <>
                    <div className={styles.grid}>
                        {wishlistItems.map((item) => (
                            <div key={item._id} className={styles.card}>
                                <img
                                    src={item.imageUrl ? `http://localhost:4000${item.imageUrl}` : 'https://via.placeholder.com/300'}
                                    alt={item.name}
                                    className={styles.cardImage}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/300';
                                    }}
                                />
                                <div className={styles.cardContent}>
                                    <h2 className={styles.cardTitle}>{item.name}</h2>
                                    <p className={styles.cardPrice}>${item.price}</p>
                                    {item.category && (
                                        <p className={styles.cardCategory}>
                                            {item.category.name}
                                        </p>
                                    )}
                                    <button
                                        className={styles.removeButton}
                                        onClick={() => handleRemove(item._id)}
                                    >
                                        <span>🗑️</span>
                                        Remove from Wishlist
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            ) : (
                <div className={styles.emptyState}>
                    <h2 className={styles.emptyStateTitle}>Your wishlist is empty</h2>
                    <p className={styles.emptyStateText}>
                        Browse our products and add items to your wishlist!
                    </p>
                    <Link to="/products" className={styles.browseButton}>
                        Browse Products
                    </Link>
                </div>
            )}
        </div>
    );
};

export default WishlistPage; 