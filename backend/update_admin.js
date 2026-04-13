const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campuscare';

const updateAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Update or create admin
        const admin = await User.findOneAndUpdate(
            { role: 'admin' },
            {
                fName: 'Admin',
                lastName: 'CampusCare',
                email: 'omkava9@gmail.com',
                password: hashedPassword,
                role: 'admin',
                status: 'Active'
            },
            { upsert: true, new: true }
        );

        console.log('✓ Admin user updated successfully!');
        console.log('Email: omkava9@gmail.com');
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateAdmin();
