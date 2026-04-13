
const mongoose = require('mongoose');
const connectDb = ()=>{
    console.log('Connecting to MongoDB Atlas...');
    mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000 // Fast fail
    }).then(()=>{
        console.log('--- MongoDB Connection Successful ---');
    }).catch((err)=>{
        console.error('--- MongoDB Connection FAILED ---');
        console.error('Error detail:', err.message);
    })
}

module.exports = connectDb;