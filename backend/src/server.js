const mongoose = require('mongoose');
const app = require('./app');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('MongoDB connected');
        // Auto-create admin user if not exists
        const admin = await User.findOne({ username: 'admin' });
        if (!admin) {
            const hashedPassword = await bcrypt.hash('admin', 10);
            await User.create({
                username: 'admin',
                name: 'Admin',
                email: 'admin@admin.com',
                type: 'admin',
                password: hashedPassword
            });
            console.log('Admin user created: username=admin, password=admin');
        }
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }); 