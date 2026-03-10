const mongoose = require('mongoose');
require('dotenv').config();
const Location = require('./models/Location');

async function listIds() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const locs = await Location.find().limit(5);
        locs.forEach(l => console.log(`ID: ${l._id} Name: ${l.locationName}`));
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listIds();
