const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, bloodGroup, age, gender, address, isAvailable, donationHospital } = req.body;
        console.log("Received registration data:", req.body);

        // Validate input
        if (!name || !email || !password || !phone || !bloodGroup || !age || !gender || !address) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }
        
        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please provide a valid email' });
        }
        
        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        // Validate age
        if (age < 18 || age > 65) {
            return res.status(400).json({ error: 'Age must be between 18 and 65' });
        }
        
        // Check if user already exists
        const userExists = await User.findOne({ email });
        
        if (userExists) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        
        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            bloodGroup,
            age,
            gender,
            address,
            isAvailable,
            donationHospital
        });
        
        // Generate JWT
        const token = user.getSignedJwtToken();
        
        // Return user and token
        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                bloodGroup: user.bloodGroup,
                age: user.age,
                gender: user.gender,
                address: user.address,
                isAvailable: user.isAvailable,
                donationHospital: user.donationHospital
            }
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        
        // Check for validation errors from Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: messages[0] });
        }
        
        // Check for duplicate key error (another way email might be duplicated)
        if (error.code === 11000) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check for user
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check if password matches
        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT
        const token = user.getSignedJwtToken();
        
        // Return user and token
        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                bloodGroup: user.bloodGroup,
                age: user.age,
                gender: user.gender,
                address: user.address,
                isAvailable: user.isAvailable,
                donationHospital: user.donationHospital
                
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                bloodGroup: user.bloodGroup,
                age: user.age,
                gender: user.gender,
                address: user.address,
                isAvailable: user.isAvailable
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/auth/updateProfile
// @desc    Update user profile
// @access  Private
router.put('/updateProfile', protect, async (req, res) => {
    try {
        const { name, phone, bloodGroup, age, gender, address, isAvailable } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone, bloodGroup, age, gender, address, isAvailable },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                bloodGroup: user.bloodGroup,
                age: user.age,
                gender: user.gender,
                address: user.address,
                isAvailable: user.isAvailable
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/auth/toggleAvailability
// @desc    Toggle user availability
// @access  Private
router.put('/toggleAvailability', protect, async (req, res) => {
    try {
        const { isAvailable } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { isAvailable },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                bloodGroup: user.bloodGroup,
                age: user.age,
                gender: user.gender,
                address: user.address,
                isAvailable: user.isAvailable
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;