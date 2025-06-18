import React, { useState, useEffect, useContext } from 'react';
import { getAllUsers, getAllAdmins, removeAdmin, createAdmin, updateAdmin, deleteUser } from '../services/adminService';
import styles from './AdminPage.module.css';
import Pagination from '../components/Pagination';
import { AuthContext } from '../context/AuthContext';

const AdminPage = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [newAdminData, setNewAdminData] = useState({
        username: '',
        email: '',
        password: '',
        name: '',
    });

    // Separate pagination states for users and admins
    const [currentUserPage, setCurrentUserPage] = useState(1);
    const [currentAdminPage, setCurrentAdminPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const [adminTotalPages, setAdminTotalPages] = useState(1);

    // Get current user ID from localStorage
    const currentUserId = user?._id;
    const isSuperAdmin = user?.type === 'super_admin';

    useEffect(() => {
        fetchData();
    }, [activeTab, currentUserPage, currentAdminPage]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (activeTab === 'users') {
                const response = await getAllUsers(currentUserPage, 4);
                setUsers(Array.isArray(response?.data) ? response.data : []);
                setUserTotalPages(response.totalPages || 1);
            } else if (isSuperAdmin) {
                const response = await getAllAdmins(currentAdminPage, 4);
                setAdmins(Array.isArray(response?.data) ? response.data : []);
                setAdminTotalPages(response.totalPages || 1);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to fetch data');
            if (activeTab === 'users') {
                setUsers([]);
            } else {
                setAdmins([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUserPageChange = (page) => {
        setCurrentUserPage(page);
        window.scrollTo(0, 0);
    };

    const handleAdminPageChange = (page) => {
        setCurrentAdminPage(page);
        window.scrollTo(0, 0);
    };

    const handleRemoveAdmin = async (adminId) => {
        try {
            await removeAdmin(adminId);
            if (admins.length === 1 && currentAdminPage > 1) {
                setCurrentAdminPage(prev => prev - 1);
            } else {
                await fetchData();
            }
        } catch (err) {
            setError('Failed to remove admin');
            console.error(err);
        }
    };

    const handleStartEdit = (admin) => {
        setEditingAdmin(admin);
        setNewAdminData({
            name: admin.name,
            email: admin.email,
            username: admin.username,
            password: '', // Don't populate password
        });
    };

    const handleCancelEdit = () => {
        setEditingAdmin(null);
        setNewAdminData({
            username: '',
            email: '',
            password: '',
            name: '',
        });
        setError(null);
    };

    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            setLoading(true);

            // Validate required fields except password (which is optional for updates)
            if (!newAdminData.username || !newAdminData.email || !newAdminData.name) {
                setError('Name, username and email are required');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newAdminData.email)) {
                setError('Invalid email format');
                return;
            }

            // Only include password in update if it was changed
            const updateData = {
                name: newAdminData.name.trim(),
                email: newAdminData.email.trim(),
                username: newAdminData.username.trim(),
                ...(newAdminData.password && { password: newAdminData.password }),
            };

            console.log('Updating admin with data:', updateData);
            const result = await updateAdmin(editingAdmin._id, updateData);
            console.log('Update admin response:', result);

            handleCancelEdit();
            await fetchData();
        } catch (err) {
            console.error('Error updating admin:', err.response?.data || err);
            setError(err.response?.data?.message || err.response?.data?.details || 'Failed to update admin');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            setLoading(true);

            // Validate required fields
            if (!newAdminData.username || !newAdminData.email || !newAdminData.password || !newAdminData.name) {
                setError('All fields are required');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newAdminData.email)) {
                setError('Invalid email format');
                return;
            }

            // Validate password length
            if (newAdminData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                return;
            }

            const adminData = {
                name: newAdminData.name.trim(),
                email: newAdminData.email.trim(),
                username: newAdminData.username.trim(),
                password: newAdminData.password
            };

            console.log('Creating admin with data:', adminData);
            const result = await createAdmin(adminData);
            console.log('Create admin response:', result);

            setNewAdminData({ username: '', email: '', password: '', name: '' });
            setError(null);
            setActiveTab('admins');
            await fetchData();
        } catch (err) {
            console.error('Error creating admin:', err.response?.data || err);
            setError(err.response?.data?.message || err.response?.data?.details || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAdminData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                setError(null);
                await deleteUser(userId);
                if (users.length === 1 && currentUserPage > 1) {
                    setCurrentUserPage(prev => prev - 1);
                } else {
                    await fetchData();
                }
            } catch (err) {
                setError('Failed to delete user');
                console.error(err);
            }
        }
    };

    const renderUserTable = () => (
        <div className={styles.tableContainer}>
            {users.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No users found.</p>
                </div>
            ) : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <button
                                            className={`${styles.actionButton} ${styles.danger}`}
                                            onClick={() => handleDeleteUser(user._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <Pagination
                        currentPage={currentUserPage}
                        totalPages={userTotalPages}
                        onPageChange={handleUserPageChange}
                    />
                </>
            )}
        </div>
    );

    const renderAdminForm = () => (
        <div className={styles.form}>
            <h2>Create New Admin</h2>
            <form onSubmit={handleCreateAdmin}>
                <div className={styles.formGroup}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={newAdminData.name}
                        onChange={handleInputChange}
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={newAdminData.username}
                        onChange={handleInputChange}
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={newAdminData.email}
                        onChange={handleInputChange}
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={newAdminData.password}
                        onChange={handleInputChange}
                        className={styles.input}
                    />
                </div>
                <button type="submit" className={`${styles.actionButton} ${styles.primary}`}>
                    Create Admin
                </button>
            </form>
        </div>
    );

    const renderAdminTable = () => (
        <div className={styles.tableContainer}>
            {admins.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No admins found.</p>
                </div>
            ) : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((admin) => (
                                <tr key={admin._id}>
                                    <td>{admin.name}</td>
                                    <td>{admin.username}</td>
                                    <td>{admin.email}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={`${styles.actionButton} ${styles.primary}`}
                                                onClick={() => handleStartEdit(admin)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.danger}`}
                                                onClick={() => handleRemoveAdmin(admin._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <Pagination
                        currentPage={currentAdminPage}
                        totalPages={adminTotalPages}
                        onPageChange={handleAdminPageChange}
                    />
                </>
            )}
        </div>
    );

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Admin Dashboard</h1>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
                    onClick={() => {
                        setActiveTab('users');
                        setCurrentUserPage(1);
                    }}
                >
                    Users
                </button>
                {isSuperAdmin && (
                    <button
                        className={`${styles.tab} ${activeTab === 'admins' ? styles.activeTab : ''}`}
                        onClick={() => {
                            setActiveTab('admins');
                            setCurrentAdminPage(1);
                        }}
                    >
                        Manage Admins
                    </button>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <>
                    {activeTab === 'users' ? (
                        renderUserTable()
                    ) : (
                        isSuperAdmin && (
                            <div className={styles.adminSection}>
                                {!editingAdmin ? (
                                    <>
                                        {renderAdminForm()}
                                        {renderAdminTable()}
                                    </>
                                ) : (
                                    <div className={styles.form}>
                                        <h2>Edit Admin</h2>
                                        <form onSubmit={handleUpdateAdmin}>
                                            <div className={styles.formGroup}>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    placeholder="Full Name"
                                                    value={newAdminData.name}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    placeholder="Username"
                                                    value={newAdminData.username}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder="Email"
                                                    value={newAdminData.email}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    placeholder="Password (leave empty to keep current)"
                                                    value={newAdminData.password}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formButtons}>
                                                <button type="submit" className={`${styles.actionButton} ${styles.primary}`}>
                                                    Update Admin
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    className={`${styles.actionButton} ${styles.secondary}`}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
};

export default AdminPage; 