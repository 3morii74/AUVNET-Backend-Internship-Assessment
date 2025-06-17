import React, { useState } from 'react';

const ProductForm = ({ categories, onSubmit }) => {
    const [form, setForm] = useState({
        name: '', description: '', price: '', category: '', image: null
    });
    const [error, setError] = useState('');

    const handleChange = e => {
        const { name, value, files } = e.target;
        setForm(f => ({ ...f, [name]: files ? files[0] : value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.description || !form.price || !form.category) {
            setError('All fields are required.');
            return;
        }
        if (isNaN(form.price) || Number(form.price) <= 0) {
            setError('Price must be a positive number.');
            return;
        }
        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => v && data.append(k, v));
        try {
            await onSubmit(data);
            setForm({ name: '', description: '', price: '', category: '', image: null });
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating product');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
            <br />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
            <br />
            <input name="price" placeholder="Price" value={form.price} onChange={handleChange} type="number" min="0.01" step="0.01" />
            <br />
            <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <br />
            <input name="image" type="file" accept="image/*" onChange={handleChange} />
            <br />
            <button type="submit">Create Product</button>
        </form>
    );
};

export default ProductForm; 