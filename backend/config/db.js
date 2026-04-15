
const mongoose = require('mongoose');

const connectDb = () => {
    if (mongoose.connection.readyState >= 1) return;

    if (!process.env.MONGO_URI) {
        console.error('✗ MONGO_URI environment variable is not set');
        if (process.env.VERCEL) {
            console.error('✗ On Vercel: Please set MONGO_URI in your Vercel project environment variables');
        }
        return;
    }

    console.log('Attempting MongoDB connection...');
    console.log('Connection string format:', process.env.MONGO_URI.substring(0, 30) + '...');

    mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 10
    })
    .then(() => {
        console.log('✓ MongoDB Connected Successfully');
    })
    .catch(err => {
        console.error('✗ MongoDB Connection Error:', err.message);
        console.error('Error Code:', err.code);
        console.error('Full Error:', JSON.stringify(err, null, 2));
    });
};

module.exports = connectDb;