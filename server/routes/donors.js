const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/donors/search
// @desc    Search for donors by blood group and district
// @access  Private
router.get('/search', protect, async (req, res) => {
    try {
        const { bloodGroup, district } = req.query;

        if (!bloodGroup || !district) {
            return res.status(400).json({ error: 'Please provide both blood group and district' });
        }

        // Case-insensitive search for district
        const donors = await User.find({
            bloodGroup,
            address: { $regex: new RegExp(`^${district}$`, 'i') }, // Matches district case-insensitively
            isAvailable: true,
            _id: { $ne: req.user.id } // Exclude the current user
        }).select('name bloodGroup age gender address phone email donationHospital');

        res.status(200).json({
            success: true,
            count: donors.length,
            donors,
            message: donors.length
                ? `Found ${donors.length} donors in ${district}.`
                : `No donors found in ${district}.`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/donors/all
// @desc    Get all available donors
// @access  Private
router.get('/all', protect, async (req, res) => {
    try {
        const donors = await User.find({
            isAvailable: true,
            _id: { $ne: req.user.id } // Exclude the current user
        }).select('name bloodGroup age gender address phone email donationHospital');

        res.status(200).json({
            success: true,
            count: donors.length,
            donors
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
