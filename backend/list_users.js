const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function listUsers() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({ role: 'admin' }, 'fName email role');
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}

listUsers();
