const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');



const LoginAdmin = async (req, resp) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }); // look up by email field
        if (!user) {
            return resp.status(404).json({ message: 'User not found' });
        }
        // if(user.role !== 'admin'){
        //     return resp.status(403).json({message: 'Access denied'});
        // }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return resp.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '250h' });
        // set httpOnly cookie with token
        resp.cookie('token', token, {
            httpOnly: true,
            maxAge: 250 * 60 * 60 * 1000, // 250 hours
            secure: process.env.NODE_ENV === 'production'
        }).json({
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
        resp.status(500).json({ message: 'Server error' });
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
    const token = req.cookies?.token;

    if (!token) {
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
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // decoded contains { userId: ... }
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        // attach user to request if needed
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}

const isContractor = async (req, res, next) => {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
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
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
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