
const mongoose = require('mongoose');

// Global connection cache for serverless
let isConnecting = false;

const connectDb = async () => {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
        console.log('✓ Already connected to MongoDB');
        return Promise.resolve();
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
        console.log('Connection attempt in progress...');
        return Promise.resolve();
    }

    if (!process.env.MONGO_URI) {
        console.error('✗ MONGO_URI environment variable is not set');
        return Promise.reject(new Error('MONGO_URI not defined'));
    }

    isConnecting = true;

    try {
        console.log('Attempting MongoDB connection...');
        console.log('Connection string format:', process.env.MONGO_URI.substring(0, 30) + '...');

        await mongoose.connect(process.env.MONGO_URI);

        isConnecting = false;
        console.log('✓ MongoDB Connected Successfully');
        return Promise.resolve();
    } catch (err) {
        isConnecting = false;
        console.error('✗ MongoDB Connection Error:', err.message);
        console.error('Error Code:', err.code);
        return Promise.reject(err);
    }
};

module.exports = connectDb;