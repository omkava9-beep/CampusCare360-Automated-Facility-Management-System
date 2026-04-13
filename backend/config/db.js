
const mongoose = require('mongoose');
const connectDb = () => {
    if (mongoose.connection.readyState >= 1) return;

    mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000
    })
    .then(() => console.log('✓ MongoDB Connected'))
    .catch(err => console.error('✗ MongoDB Connection Error:', err.message));
};

module.exports = connectDb;