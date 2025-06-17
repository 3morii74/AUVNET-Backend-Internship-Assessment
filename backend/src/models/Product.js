const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2 },
    description: { type: String, required: true, minlength: 10 },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema); 