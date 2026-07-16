const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { auth } = require('../middleware/auth');
const { validateRegister, validateLogin, validatePasswordChange } = require('../middleware/validation');
const { sendEmail } = require('../utils/email');
const { sendOtp, verifyOtp, consumePhoneVerification, normalizePhone } = require('../utils/otp');
const { sendSms } = require('../services/sms');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth
    } = req.body;
    const normalizedPhoneNumber = normalizePhone(phoneNumber);

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username },
          { phoneNumber: normalizedPhoneNumber },
          { phoneNumber: normalizedPhoneNumber.replace('+251', '0') },
        ]
      }
    });

    if (existingUser) {
      const msg = existingUser.email === email
        ? 'User with this email already exists'
        : existingUser.username === username
          ? 'Username already taken'
          : 'Phone number already registered';
      return res.status(400).json({ message: msg });
    }

    if (!(await consumePhoneVerification(normalizedPhoneNumber))) {
      return res.status(400).json({ message: 'Phone number not verified. Complete OTP verification first.' });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phoneNumber: normalizedPhoneNumber,
      dateOfBirth
    });

    // Create wallet for the user (wrapped in try-catch to handle failures)
    try {
      await Wallet.create({
        userId: user.id
      });
    } catch (walletError) {
      console.error('Wallet creation failed:', walletError);
      await user.destroy();
      return res.status(500).json({ message: 'Failed to create user wallet. Registration cancelled.' });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Send verification email (optional for now)
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${verificationToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify your Fanora account',
        html: `
          <h2>Welcome to Fanora!</h2>
          <p>Hello ${user.firstName},</p>
          <p>Thank you for joining Fanora. Please verify your email address by clicking the link below:</p>
          <a href="${verificationUrl}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
          <p>If you didn't create this account, please ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        `
      });
    } catch (emailError) {
      console.log('Email sending failed (continuing without email):', emailError.message);
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        isCreator: user.isCreator,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required' });

    const purpose = req.body.purpose === 'login' ? 'login' : 'register';
    if (purpose === 'login') {
      const phone = normalizePhone(phoneNumber);
      const account = await User.findOne({
        where: {
          [Op.or]: [
            { phoneNumber: phone },
            { phoneNumber: phone.replace('+251', '0') },
          ],
        },
        attributes: ['id'],
      });
      if (!account) return res.status(404).json({ message: 'No account found for this phone number' });
    }
    const result = await sendOtp(phoneNumber, purpose);
    if (!result.ok) {
      return res.status(429).json({ message: result.message, waitSec: result.waitSec });
    }

    await sendSms({
      to: result.phone,
      message: `${result.code} is your Fanora verification code. It expires in 5 minutes. Do not share it.`,
    });

    const payload = { success: true, message: 'OTP sent', expiresIn: result.expiresIn };
    if (process.env.NODE_ENV === 'development' && (process.env.SMS_PROVIDER || 'console') === 'console') {
      payload.devCode = result.code;
    }
    res.json(payload);
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, code, purpose = 'register' } = req.body;
    if (!phoneNumber || !code) {
      return res.status(400).json({ message: 'Phone number and OTP code are required' });
    }

    const result = await verifyOtp(phoneNumber, code, purpose);
    if (!result.ok) {
      return res.status(400).json({ message: result.message });
    }

    if (purpose === 'login') {
      const phone = normalizePhone(phoneNumber);
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { phoneNumber: phone },
            { phoneNumber: phone.replace('+251', '0') },
          ],
        },
        include: [{ model: Wallet, as: 'wallet' }],
      });
      if (!user) {
        return res.status(404).json({ message: 'No account found for this phone number' });
      }
      user.lastActive = new Date();
      user.isOnline = true;
      await user.save();
      const token = generateToken(user.id);
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          isCreator: user.isCreator,
          isVerified: user.isVerified,
          role: user.role,
        },
      });
    }

    res.json({ success: true, message: 'Phone verified', phoneVerified: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Wallet, as: 'wallet' }]
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last active and online status
    user.lastActive = new Date();
    user.isOnline = true;
    await user.save();

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        bio: user.bio,
        isCreator: user.isCreator,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        wallet: user.wallet ? {
          id: user.wallet.id,
          balance: user.wallet.balance,
          currency: user.wallet.currency
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Update user online status
    req.user.isOnline = false;
    await req.user.save();

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Wallet, as: 'wallet' }]
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        isCreator: user.isCreator,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        wallet: user.wallet ? {
          id: user.wallet.id,
          balance: user.wallet.balance,
          currency: user.wallet.currency,
          hasPinCode: user.wallet.hasPinCode
        } : null,
        settings: user.settings,
        lastActive: user.lastActive,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.post('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    // Always return success to avoid account enumeration
    if (!user) {
      return res.json({ message: 'If an account exists with that email, a reset link has been sent' });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;
    try {
      const { emailTemplates } = require('../utils/email');
      const template = emailTemplates.passwordReset(user.firstName || user.username, resetUrl);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (emailError) {
      console.error('Password reset email failed:', emailError.message);
      // Still return success; token is stored for manual/dev use
      if (process.env.NODE_ENV === 'development') {
        return res.json({
          message: 'If an account exists with that email, a reset link has been sent',
          devResetToken: resetToken,
          devResetUrl: resetUrl,
        });
      }
    }

    res.json({ message: 'If an account exists with that email, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Private
router.post('/resend-verification', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email/${verificationToken}`;
    try {
      const { emailTemplates } = require('../utils/email');
      const template = emailTemplates.emailVerification
        ? emailTemplates.emailVerification(user.firstName || user.username, verifyUrl)
        : {
            subject: 'Verify your Fanora email',
            html: `<p>Hello ${user.firstName || user.username},</p><p><a href="${verifyUrl}">Verify Email</a></p>`,
          };
      await sendEmail({ to: user.email, subject: template.subject, html: template.html });
    } catch (emailError) {
      console.error('Resend verification email failed:', emailError.message);
      if (process.env.NODE_ENV === 'development') {
        return res.json({
          message: 'Verification email sent',
          devVerificationToken: verificationToken,
          devVerifyUrl: verifyUrl,
        });
      }
    }

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', auth, validatePasswordChange, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check current password
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

module.exports = router;