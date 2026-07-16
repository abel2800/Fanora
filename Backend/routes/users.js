const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { auth, isEmailVerified, optionalAuth } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/me/settings
router.get('/me/settings', auth, async (req, res) => {
  try {
    res.json({ success: true, data: req.user.settings || {} });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/me/settings
router.put('/me/settings', auth, async (req, res) => {
  try {
    const current = req.user.settings || {};
    const incoming = req.body || {};
    req.user.settings = {
      ...current,
      ...incoming,
      notifications: {
        ...(current.notifications || {}),
        ...(incoming.notifications || {}),
      },
      privacy: {
        ...(current.privacy || {}),
        ...(incoming.privacy || {}),
      },
      preferences: {
        ...(current.preferences || {}),
        ...(incoming.preferences || {}),
      },
    };
    await req.user.save();
    res.json({ success: true, message: 'Settings updated', data: req.user.settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/me/device-token
router.post('/me/device-token', auth, async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Device token is required' });
    }
    const settings = req.user.settings || {};
    const tokens = Array.isArray(settings.deviceTokens) ? settings.deviceTokens : [];
    const filtered = tokens.filter((t) => t.token !== token);
    filtered.push({ token, platform: platform || 'android', updatedAt: new Date().toISOString() });
    req.user.settings = { ...settings, deviceTokens: filtered.slice(-10) };
    await req.user.save();
    res.json({ success: true, message: 'Device token registered' });
  } catch (error) {
    console.error('Device token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/followers/:userId
router.get('/followers/:userId', optionalAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const followers = await user.getFollowers({
      attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage', 'isCreator', 'isVerified'],
      joinTableAttributes: [],
    });
    res.json({ success: true, data: followers });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/following/:userId
router.get('/following/:userId', optionalAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const following = await user.getFollowing({
      attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage', 'isCreator', 'isVerified'],
      joinTableAttributes: [],
    });
    res.json({ success: true, data: following });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/me/following
router.get('/me/following', auth, async (req, res) => {
  try {
    const following = await req.user.getFollowing({
      attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage', 'isCreator', 'isVerified', 'bio'],
      joinTableAttributes: [],
    });
    res.json({ success: true, data: following });
  } catch (error) {
    console.error('Get my following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/profile/:username
router.get('/profile/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      where: { username },
      attributes: {
        exclude: ['password', 'email', 'passwordResetToken', 'passwordResetExpires', 'emailVerificationToken'],
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let isFollowing = false;
    if (req.user) {
      const following = await req.user.getFollowing({
        where: { id: user.id },
        attributes: ['id'],
        joinTableAttributes: [],
      });
      isFollowing = following.length > 0;
    }

    const followerCount = await user.countFollowers();
    const followingCount = await user.countFollowing();

    res.json({
      user: {
        ...user.toJSON(),
        followerCount,
        followingCount,
        isFollowing,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
router.put('/profile', auth, isEmailVerified, validateProfileUpdate, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'bio', 'phoneNumber', 'profileImage', 'coverImage'];

    allowedUpdates.forEach((field) => {
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
        coverImage: req.user.coverImage,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/follow/:userId
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

    await req.user.addFollowing(userToFollow);

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/unfollow/:userId
router.post('/unfollow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const userToUnfollow = await User.findByPk(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    await req.user.removeFollowing(userToUnfollow);

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
