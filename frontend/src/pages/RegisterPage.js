import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
    const [form, setForm] = useState({ username: '', name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await registerUser(form);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className={styles.registerContainer}>
            <div className={styles.registerBox}>
                <h2 className={styles.title}>Register</h2>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <input
                        className={styles.input}
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className={styles.input}
                        name="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className={styles.input}
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className={styles.input}
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <button className={styles.button} type="submit">
                        Register
                    </button>
                </form>
                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}
            </div>
        </div>
    );
};

export default RegisterPage; 