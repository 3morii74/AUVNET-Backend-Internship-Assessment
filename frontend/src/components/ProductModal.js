import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import styles from './ProductModal.module.css';

const ProductModal = ({ product = null, categories = [], onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                category: product.category?._id || product.category || '',
                image: null
            });
            // Set image preview if product has an image
            if (product.imageUrl) {
                setImagePreview(`http://localhost:5000${product.imageUrl}`);
            }
        }
    }, [product]);

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.description.trim()) errors.description = 'Description is required';
        if (!formData.price || parseFloat(formData.price) <= 0) {
            errors.price = 'Price must be greater than 0';
        }
        if (!formData.category) errors.category = 'Category is required';
        if (!product && !formData.image) errors.image = 'Image is required for new products';
        return errors;
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setError('');
        setValidationErrors(prev => ({ ...prev, [name]: '' }));

        if (name === 'image' && files[0]) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(files[0].type)) {
                setValidationErrors(prev => ({
                    ...prev,
                    image: 'Please select a valid image file (JPEG, PNG, or GIF)'
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                image: files[0]
            }));
            setImagePreview(URL.createObjectURL(files[0]));
        } else if (name === 'price') {
            // Only allow positive numbers with up to 2 decimal places
            const regex = /^\d*\.?\d{0,2}$/;
            if (value === '' || regex.test(value)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});

        // Log the current form data
        console.log('Current form data:', formData);

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setLoading(true);
        try {
            // Create a new FormData instance
            const form = new FormData();

            // Log each field before appending
            console.log('Name:', formData.name.trim());
            console.log('Description:', formData.description.trim());
            console.log('Price:', parseFloat(formData.price).toFixed(2));
            console.log('Category:', formData.category);
            console.log('Image:', formData.image);

            // Append all fields to form data
            form.append('name', formData.name.trim());
            form.append('description', formData.description.trim());
            form.append('price', parseFloat(formData.price).toFixed(2));
            form.append('category', formData.category);

            // Only append image if it exists and is a new image
            if (formData.image instanceof File) {
                form.append('image', formData.image);
            }

            // Log the form entries to verify data
            console.log('Form entries:');
            for (let [key, value] of form.entries()) {
                console.log(`${key}:`, value);
            }

            // Submit the form
            await onSubmit(form);
            onClose();
        } catch (err) {
            console.error('Error submitting product:', err);
            console.error('Error details:', err.response?.data);

            if (err.response?.data?.details) {
                setValidationErrors(err.response.data.details);
            } else {
                setError(err.message || 'Failed to submit product');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={true} onHide={onClose} centered className={styles.modal}>
            <Modal.Header closeButton className={styles.modalHeader}>
                <Modal.Title>{product ? 'Edit Product' : 'Add New Product'}</Modal.Title>
            </Modal.Header>
            <Modal.Body className={styles.modalBody}>
                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Name *</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            isInvalid={!!validationErrors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.name}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description *</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter product description"
                            rows={3}
                            isInvalid={!!validationErrors.description}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.description}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Price *</Form.Label>
                        <Form.Control
                            type="text"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Enter price"
                            isInvalid={!!validationErrors.price}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.price}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Category *</Form.Label>
                        <Form.Select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            isInvalid={!!validationErrors.category}
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.category}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>{product ? 'Update Image' : 'Image *'}</Form.Label>
                        <Form.Control
                            type="file"
                            name="image"
                            onChange={handleChange}
                            accept="image/*"
                            isInvalid={!!validationErrors.image}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.image}
                        </Form.Control.Feedback>
                        {imagePreview && (
                            <div className={styles.imagePreview}>
                                <img src={imagePreview} alt="Preview" />
                            </div>
                        )}
                    </Form.Group>

                    <div className={styles.modalFooter}>
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : (product ? 'Update Product' : 'Create Product')}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ProductModal; 