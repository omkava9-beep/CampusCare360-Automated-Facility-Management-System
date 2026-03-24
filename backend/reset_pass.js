const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetPassword() {
    await mongoose.connect(process.env.MONGO_URI);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    await User.findOneAndUpdate({ email: 'admin@campus.com' }, { password: hashedPassword });
    console.log('Password reset for admin@campus.com');
    process.exit(0);
}

resetPassword();
