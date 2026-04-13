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
  origin: true, // Allow all origins in production, or configure specifically
  credentials: true,
}));

// Parse JSON and URL-encoded bodies BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/' , (req , res) =>{
    res.send('hello world');
})

app.get('/health', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({
        status: 'ok',
        database: dbStatus,
        environment: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL
    });
});

app.use('/api/v1/user' , userRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err.stack);
    res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});
const http = require('http');
const { initSocket } = require('./utils/socket');

const server = http.createServer(app);
initSocket(server);

connectDb();

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    server.listen(port, () => {
        console.log('Server running on port ' + port);
    });
}

module.exports = app;