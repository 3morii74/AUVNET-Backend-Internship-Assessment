import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../services/wishlistService';
import styles from './WishlistPage.module.css';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [removingItems, setRemovingItems] = useState(new Set());

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getWishlist();
            console.log('Wishlist response:', response);

            if (!response || !Array.isArray(response.wishlist)) {
                throw new Error('Invalid wishlist data received');
            }

            setWishlist(response.wishlist);
        } catch (err) {
            console.error('Error fetching wishlist:', err);
            setError(err.response?.data?.message || 'Failed to fetch wishlist');
            setWishlist([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            setError(null);
            setRemovingItems(prev => new Set([...prev, productId]));

            await removeFromWishlist(productId);

            // Update local state to remove the item
            setWishlist(prev => prev.filter(item => item._id !== productId));
        } catch (err) {
            console.error('Error removing from wishlist:', err);
            setError(err.response?.data?.message || 'Failed to remove from wishlist');
        } finally {
            setRemovingItems(prev => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>Oops! Something went wrong</h2>
                    <p>{error}</p>
                    <button
                        className={styles.retryButton}
                        onClick={fetchWishlist}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <h2 className={styles.emptyStateTitle}>Your wishlist is empty</h2>
                    <p className={styles.emptyStateText}>
                        Browse our products and add items to your wishlist!
                    </p>
                    <Link to="/products" className={styles.browseButton}>
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>My Wishlist</h1>
                <p className={styles.subtitle}>
                    {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
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

            <div className={styles.grid}>
                {wishlist.map((item) => (
                    <div key={item._id} className={styles.card}>
                        <img
                            src={item.imageUrl ? `http://localhost:5000${item.imageUrl}` : 'https://via.placeholder.com/300'}
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
                                className={`${styles.removeButton} ${removingItems.has(item._id) ? styles.removing : ''}`}
                                onClick={() => handleRemove(item._id)}
                                disabled={removingItems.has(item._id)}
                            >
                                {removingItems.has(item._id) ? 'Removing...' : 'Remove from Wishlist'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WishlistPage; 