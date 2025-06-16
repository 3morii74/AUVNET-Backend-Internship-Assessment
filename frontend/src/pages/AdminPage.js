import React, { useState, useEffect } from 'react';
import {
    getUsers,
    getAdmins,
    deleteUser,
    createAdmin,
    deleteAdmin,
    updateAdmin,
} from '../services/adminService';
import styles from './AdminPage.module.css';

const AdminPage = () => {
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

    // Get current user ID from localStorage
    const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (activeTab === 'users') {
                const response = await getUsers();
                // Ensure users is always an array
                setUsers(Array.isArray(response?.data) ? response.data : []);
            } else {
                const response = await getAdmins();
                console.log('Admins response:', response);
                // Ensure admins is always an array
                setAdmins(Array.isArray(response?.data) ? response.data : []);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to fetch data');
            // Set empty arrays on error
            if (activeTab === 'users') {
                setUsers([]);
            } else {
                setAdmins([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId);
            await fetchData();
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        try {
            await deleteAdmin(adminId);
            await fetchData();
        } catch (err) {
            console.error('Error deleting admin:', err);
            setError(err.response?.data?.message || 'Failed to delete admin');
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
                name: newAdminData.name,
                email: newAdminData.email,
                username: newAdminData.username,
                ...(newAdminData.password && { password: newAdminData.password }),
            };

            const response = await updateAdmin(editingAdmin._id, updateData);
            console.log('Admin updated:', response);

            // Clear form and editing state
            handleCancelEdit();

            // Refresh admin list
            await fetchData();
        } catch (err) {
            console.error('Error updating admin:', err);
            setError(err.response?.data?.message || 'Failed to update admin');
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

            const response = await createAdmin(newAdminData);
            console.log('Admin created:', response);

            // Clear form
            setNewAdminData({ username: '', email: '', password: '', name: '' });
            setError(null);

            // Switch to admin tab if not already there
            setActiveTab('admins');

            // Refresh admin list
            await fetchData();
        } catch (err) {
            console.error('Error creating admin:', err);
            setError(err.response?.data?.message || 'Failed to create admin');
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

    const renderUserTable = () => (
        <div className={styles.tableContainer}>
            {users.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No users found.</p>
                </div>
            ) : (
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
                                        className={styles.deleteButton}
                                        onClick={() => handleDeleteUser(user._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    const renderAdminForm = () => (
        <form className={styles.form} onSubmit={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}>
            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}
            <div className={styles.formGroup}>
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={newAdminData.name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={newAdminData.username}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={newAdminData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                />
                <input
                    type="password"
                    name="password"
                    placeholder={editingAdmin ? "Leave blank to keep current password" : "Password"}
                    value={newAdminData.password}
                    onChange={handleInputChange}
                    required={!editingAdmin}
                    disabled={loading}
                />
                <div className={styles.formButtons}>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? (editingAdmin ? 'Updating...' : 'Creating...') : (editingAdmin ? 'Update Admin' : 'Create Admin')}
                    </button>
                    {editingAdmin && (
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={handleCancelEdit}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </form>
    );

    const renderAdminTable = () => (
        <div className={styles.tableContainer}>
            {renderAdminForm()}

            {admins.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No admins found.</p>
                </div>
            ) : (
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
                            <tr key={admin._id} className={editingAdmin?._id === admin._id ? styles.editing : ''}>
                                <td>{admin.name}</td>
                                <td>{admin.username}</td>
                                <td>{admin.email}</td>
                                <td>
                                    {admin._id !== currentUserId && (
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={styles.editButton}
                                                onClick={() => handleStartEdit(admin)}
                                                disabled={loading || editingAdmin?._id === admin._id}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteAdmin(admin._id)}
                                                disabled={loading || editingAdmin?._id === admin._id}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Admin Dashboard</h1>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''
                        }`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'admins' ? styles.activeTab : ''
                        }`}
                    onClick={() => setActiveTab('admins')}
                >
                    Admins
                </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {activeTab === 'users' ? renderUserTable() : renderAdminTable()}
        </div>
    );
};

export default AdminPage; 