
const mongoose = require('mongoose');
const connectDb = ()=>{
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log('MongoDb Connection successful');
    }).catch((err)=>{
        console.log('error'+err);
    })
}

module.exports = connectDb;