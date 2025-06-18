import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? styles.activeLink : '';
    };

    const isAdminUser = user?.type === 'admin' || user?.type === 'super_admin';

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContent}>
                <Link to="/products" className={styles.logo}>
                    E-Commerce
                </Link>
                <div className={styles.navLinks}>
                    <Link
                        to="/products"
                        className={`${styles.navLink} ${isActive('/products')}`}
                    >
                        Products
                    </Link>
                    <Link
                        to="/categories"
                        className={`${styles.navLink} ${isActive('/categories')}`}
                    >
                        Categories
                    </Link>
                    {user && !isAdminUser && (
                        <Link
                            to="/wishlist"
                            className={`${styles.navLink} ${isActive('/wishlist')}`}
                        >
                            Wishlist
                        </Link>
                    )}
                    {isAdminUser && (
                        <Link
                            to="/admin"
                            className={`${styles.navLink} ${isActive('/admin')}`}
                        >
                            Admin
                        </Link>
                    )}
                    <button onClick={logout} className={styles.logoutButton}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 