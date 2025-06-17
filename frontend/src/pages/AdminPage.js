import React, { useState, useEffect } from 'react';
import { getAllUsers, getAllAdmins, makeAdmin, removeAdmin, createAdmin, updateAdmin } from '../services/adminService';
import styles from './AdminPage.module.css';
import Pagination from '../components/Pagination';

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

    // Separate pagination states for users and admins
    const [currentUserPage, setCurrentUserPage] = useState(1);
    const [currentAdminPage, setCurrentAdminPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const [adminTotalPages, setAdminTotalPages] = useState(1);

    // Get current user ID from localStorage
    const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;

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
            } else {
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

    const handleMakeAdmin = async (userId) => {
        try {
            await makeAdmin(userId);
            await fetchData();
        } catch (err) {
            setError('Failed to make user admin');
            console.error(err);
        }
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
                                            className={styles.actionButton}
                                            onClick={() => handleMakeAdmin(user._id)}
                                        >
                                            Make Admin
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
                                                    onClick={() => handleRemoveAdmin(admin._id)}
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

                    <Pagination
                        currentPage={currentAdminPage}
                        totalPages={adminTotalPages}
                        onPageChange={handleAdminPageChange}
                    />
                </>
            )}
        </div>
    );

    if (loading && !users.length && !admins.length) {
        return <div className={styles.loading}>Loading...</div>;
    }

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
                <button
                    className={`${styles.tab} ${activeTab === 'admins' ? styles.activeTab : ''}`}
                    onClick={() => {
                        setActiveTab('admins');
                        setCurrentAdminPage(1);
                    }}
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