const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    type: { type: String, enum: ['admin', 'user'], default: 'user' },
    password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema); 