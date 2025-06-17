import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProductById } from '../services/productService';
import { addToWishlist, removeFromWishlist } from '../services/wishlistService';
import styles from './ProductDetailsPage.module.css';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wishlistMessage, setWishlistMessage] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductById(id);
                setProduct({
                    ...data,
                    isOwner: user && (user.type === 'admin' || user.id === data.user._id)
                });
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, user]);

    const handleWishlist = async (productId, isInWishlist) => {
        try {
            setWishlistMessage(null); // Clear any previous messages
            if (isInWishlist) {
                await removeFromWishlist(productId);
                setWishlistMessage({ type: 'success', text: 'Product removed from wishlist' });
            } else {
                await addToWishlist(productId);
                setWishlistMessage({ type: 'success', text: 'Product added to wishlist' });
            }
            // Refresh product data
            const updatedProduct = await getProductById(id);
            setProduct({
                ...updatedProduct,
                isOwner: user && (user.type === 'admin' || user.id === updatedProduct.user._id)
            });
        } catch (err) {
            console.error('Wishlist error:', err);
            if (err.response?.data?.message === 'Product already in wishlist') {
                setWishlistMessage({ type: 'error', text: 'This product is already in your wishlist' });
            } else {
                setWishlistMessage({ type: 'error', text: 'Failed to update wishlist. Please try again.' });
            }
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!product) return <div className={styles.error}>Product not found</div>;

    return (
        <div className={styles.container}>
            <button onClick={handleBack} className={styles.backButton}>
                ← Back to Products
            </button>
            {wishlistMessage && (
                <div className={`${styles.message} ${styles[wishlistMessage.type]}`}>
                    {wishlistMessage.text}
                </div>
            )}
            <div className={styles.productDetails}>
                <div className={styles.imageContainer}>
                    <img
                        src={product.imageUrl ? `http://localhost:4000${product.imageUrl}` : 'https://via.placeholder.com/500'}
                        alt={product.name}
                        className={styles.productImage}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/500';
                        }}
                    />
                </div>
                <div className={styles.info}>
                    <h1 className={styles.productName}>{product.name}</h1>
                    <p className={styles.price}>${product.price}</p>
                    {product.category && (
                        <p className={styles.category}>
                            Category: {product.category.name}
                        </p>
                    )}
                    <p className={styles.description}>{product.description}</p>
                    <div className={styles.seller}>
                        <p>Seller: {product.user.username}</p>
                    </div>
                    <div className={styles.actions}>
                        {user && user.type !== 'admin' && (
                            <button
                                className={styles.wishlistButton}
                                onClick={() => handleWishlist(product._id, product.isInWishlist)}
                            >
                                {product.isInWishlist
                                    ? '❤️ Remove from Wishlist'
                                    : '🤍 Add to Wishlist'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage; 