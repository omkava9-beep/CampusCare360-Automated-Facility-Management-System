
const mongoose = require('mongoose');

// Cache the database connection for serverless functions
let cachedConnection = null;

const connectDb = async () => {
    // Return cached connection if already connected
    if (cachedConnection) {
        console.log('✓ Using cached MongoDB connection');
        return cachedConnection;
    }

    // Return early if already trying to connect
    if (mongoose.connection.readyState === 1) {
        console.log('✓ MongoDB already connected');
        return mongoose.connection;
    }

    if (!process.env.MONGO_URI) {
        console.error('✗ MONGO_URI environment variable is not set');
        if (process.env.VERCEL) {
            console.error('✗ On Vercel: Please set MONGO_URI in your Vercel project environment variables');
        }
        throw new Error('MONGO_URI is not defined');
    }

    try {
        console.log('Attempting MongoDB connection...');
        console.log('Connection string format:', process.env.MONGO_URI.substring(0, 30) + '...');

        const connection = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 5,
            waitQueueTimeoutMS: 10000
        });

        console.log('✓ MongoDB Connected Successfully');
        cachedConnection = connection;
        return connection;
    } catch (err) {
        console.error('✗ MongoDB Connection Error:', err.message);
        console.error('Error Code:', err.code);
        if (err.reason) console.error('Reason:', err.reason);
        throw err;
    }
};

module.exports = connectDb;