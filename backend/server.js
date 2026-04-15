// load environment variables from .env file
require('dotenv').config();

// Log environment info on startup
console.log('=== Server Startup ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', !!process.env.VERCEL);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'NOT SET ⚠️');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'NOT SET ⚠️');

const express = require('express');
const cors = require('cors');
const connectDb = require('./config/db');
const app = express();
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');

const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Enable CORS for all routes
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins
    if (origin.startsWith('http://localhost')) return callback(null, true);
    
    // Allow all vercel.app domains (for all frontend deployments)
    if (origin && origin.includes('vercel.app')) return callback(null, true);
    
    // Check hardcoded origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    // Log CORS rejections in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`CORS - Rejecting origin: ${origin}`);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON and URL-encoded bodies BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/' , (req , res) =>{
    res.send('hello world');
})

app.get('/health', async (req, res) => {
    try {
        // Check current connection state  
        const readyState = mongoose.connection.readyState;
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        
        let dbStatus = 'Disconnected';
        
        if (readyState === 1) {
            dbStatus = 'Connected';
        } else if (readyState === 0 || readyState === 3) {
            // Try to reconnect if disconnected
            try {
                await connectDb();
                dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
            } catch (err) {
                console.error('Health check - Reconnection failed:', err.message);
                dbStatus = 'Disconnected';
            }
        }
        
        res.json({
            status: 'ok',
            database: dbStatus,
            environment: process.env.NODE_ENV,
            vercel: !!process.env.VERCEL,
            readyState: readyState,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Health check failed',
            database: 'Disconnected',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
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

// Initialize database connection
connectDb().catch(err => {
    console.error('Failed to connect to MongoDB on startup:', err.message);
    // Don't exit on connection failure - serverless can retry on next invocation
});

// Local-only server initialization (Socket.io)
// Only run HTTP server locally, not on Vercel serverless
if (!process.env.VERCEL) {
    const http = require('http');
    const { initSocket } = require('./utils/socket');
    const server = http.createServer(app);
    initSocket(server);
    
    server.listen(port, () => {
        console.log('Server running on port ' + port);
    });
}

// Export app for Vercel serverless functions
module.exports = app;