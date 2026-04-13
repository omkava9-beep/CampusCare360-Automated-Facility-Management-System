const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');



const LoginAdmin = async (req, resp) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return resp.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email }); // look up by email field
        if (!user) {
            return resp.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return resp.status(400).json({ message: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('❌ JWT_SECRET not set in environment');
            return resp.status(500).json({ message: 'Server configuration error' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        // Set httpOnly cookie with token
        resp.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return resp.status(200).json({
            message: 'Login successful',
            token: token,
            admin: {
                _id: user._id,
                fName: user.fName,
                midName: user.midName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Login Error:', error.message);
        console.error('Error Stack:', error.stack);
        resp.status(500).json({ message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
}
const AdminSignup = async (req, resp) => {
    const { fName, midName, lastName, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return resp.status(400).json({ message: 'User already exists' });
        }
        const hashed = await bcrypt.hash(password, 10);
        user = new User({
            fName,
            midName,
            lastName,
            email,
            password: hashed,
            role: 'admin'
        });
        await user.save();
        resp.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        resp.status(500).json({ message: 'Server error' });
    }
}


// middleware to check if request carries a valid JWT (from cookies only)
const authenticateToken = async (req, res, next) => {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const isAdmin = async (req, res, next) => {
    let token = null;

    // Prioritize Authorization Header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } 
    // Fallback to Cookie
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error("Admin Auth: JWT Verification Error:", error.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
}

const isContractor = async (req, res, next) => {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (user.role !== 'contractor') {
            return res.status(403).json({ message: 'Access denied' });
        }
        // attach user to request if needed
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}
const isStudentOrFaculty = async (req, res, next) => {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (user.role !== 'student' && user.role !== 'faculty') {
            return res.status(403).json({ message: 'Access denied' });
        }
        // attach user to request if needed
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}

module.exports = { LoginAdmin, AdminSignup, isAdmin, isContractor, isStudentOrFaculty, authenticateToken };