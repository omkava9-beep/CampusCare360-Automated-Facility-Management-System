// load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDb = require('./config/db');
const app = express();
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');

const cookieParser = require('cookie-parser');

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}));

// Parse JSON and URL-encoded bodies BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/' , (req , res) =>{
    res.send('hello world');
})

app.use('/api/v1/user' , userRoutes);;
const http = require('http');
const { initSocket } = require('./utils/socket');

const server = http.createServer(app);
initSocket(server);

connectDb();

server.listen(port, () => {
    console.log('Server running on port ' + port);
});