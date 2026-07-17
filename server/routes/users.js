const express = require('express');
const User = require('../models/User');
const Trip = require('../models/Trip');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/users/:username/profile
// @desc    Public profile — user's name, bio, and their trips
//          Never exposes email, password, or any other sensitive field
// @access  Public (no auth required)
router.get('/:username/profile', async (req, res) => {
  try {
    const username = req.params.username.trim().toLowerCase();

    // Explicitly select only safe, public fields
    const user = await User.findOne({ username }).select('name username bio createdAt');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const trips = await Trip.find({ user: user._id })
      .select('title destination startDate endDate rating coverImage')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      user: {
        name: user.name,
        username: user.username,
        bio: user.bio,
        memberSince: user.createdAt,
      },
      trips,
    });
  } catch (err) {
    console.error('Get public profile error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update the logged-in user's bio and/or username
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { bio, username } = req.body;

    if (username !== undefined) {
      const normalizedUsername = username.trim().toLowerCase();

      if (!/^[a-z0-9_.]{3,}$/.test(normalizedUsername)) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 3 characters and contain only lowercase letters, numbers, underscores, and dots',
        });
      }

      const existing = await User.findOne({ username: normalizedUsername, _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Username already taken' });
      }

      req.user.username = normalizedUsername;
    }

    if (bio !== undefined) {
      if (bio.length > 280) {
        return res.status(400).json({ success: false, message: 'Bio must be 280 characters or fewer' });
      }
      req.user.bio = bio;
    }

    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email,
        bio: req.user.bio,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Username already taken' });
    }
    console.error('Update profile error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while updating profile' });
  }
});

module.exports = router;
