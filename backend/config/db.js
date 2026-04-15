
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

    mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000,  // 30 seconds for Vercel cold start
        socketTimeoutMS: 45000,            // 45 seconds for socket operations
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 10
    })
    .then(() => console.log('✓ MongoDB Connected'))
    .catch(err => {
        console.error('✗ MongoDB Connection Error:', err.message);
        // Don't throw, allow serverless function to continue
        // Connection will be retried on next invoke
    });
};

module.exports = connectDb;