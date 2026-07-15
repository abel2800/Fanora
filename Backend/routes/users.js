const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { auth, isEmailVerified } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/profile/:username
// @desc    Get user profile by username
// @access  Public
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ 
      where: { username },
      attributes: { exclude: ['password', 'email'] },
      include: [{ model: Wallet, as: 'wallet', attributes: ['balance', 'currency'] }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, isEmailVerified, validateProfileUpdate, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'bio', 'phoneNumber', 'profileImage', 'coverImage'];
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        req.user[field] = updates[field];
      }
    });

    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user.id,
        username: req.user.username,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        bio: req.user.bio,
        profileImage: req.user.profileImage,
        coverImage: req.user.coverImage
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/follow/:userId
// @desc    Follow a user
// @access  Private
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findByPk(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add to following/followers using Sequelize associations
    await req.user.addFollowing(userToFollow);

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/unfollow/:userId
// @desc    Unfollow a user
// @access  Private
router.post('/unfollow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const userToUnfollow = await User.findByPk(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from following/followers using Sequelize associations
    await req.user.removeFollowing(userToUnfollow);

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;