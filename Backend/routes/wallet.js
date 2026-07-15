const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { User, Notification } = require('../models');
const { auth, isEmailVerified, isCreator } = require('../middleware/auth');
const { validateWalletPin } = require('../middleware/validation');
const TelebirrService = require('../services/telebirr');
const CBEService = require('../services/cbe');

const router = express.Router();

const MIN_TOPUP = 10; // ETB
const MAX_TOPUP = 50000; // ETB
const DAILY_LIMIT = 5000; // ETB
const MONTHLY_LIMIT = 50000; // ETB

// ============= GET WALLET =============
// @route   GET /api/wallet
// @desc    Get user's wallet information
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      where: { userId: req.user.id },
      include: [{
        model: Transaction,
        as: 'transactions',
        limit: 20,
        order: [['createdAt', 'DESC']]
      }]
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.json({
      success: true,
      data: {
        id: wallet.id,
        balance: parseFloat(wallet.balance),
        currency: wallet.currency,
        isActive: wallet.isActive,
        hasPinCode: wallet.hasPinCode,
        telebirrAccount: {
          isVerified: wallet.telebirrIsVerified,
          phoneNumber: wallet.telebirrPhoneNumber ? wallet.telebirrPhoneNumber.slice(-4) : null
        },
        cbeAccount: {
          isVerified: wallet.cbeIsVerified,
          phoneNumber: wallet.cbePhoneNumber ? wallet.cbePhoneNumber.slice(-4) : null,
          accountNumber: wallet.cbeAccountNumber
        },
        limits: {
          dailyLimit: DAILY_LIMIT,
          monthlyLimit: MONTHLY_LIMIT,
          minTopup: MIN_TOPUP,
          maxTopup: MAX_TOPUP
        },
        recentTransactions: wallet.transactions || []
      }
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= SET WALLET PIN =============
// @route   POST /api/wallet/set-pin
// @desc    Set wallet PIN
// @access  Private
router.post('/set-pin', auth, isEmailVerified, async (req, res) => {
  try {
    const { pin, confirmPin } = req.body;

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be 4 digits' });
    }

    if (pin !== confirmPin) {
      return res.status(400).json({ message: 'PINs do not match' });
    }

    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    await wallet.setPin(pin);

    res.json({
      success: true,
      message: 'Wallet PIN set successfully'
    });
  } catch (error) {
    console.error('Set PIN error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// ============= VERIFY WALLET PIN =============
// @route   POST /api/wallet/verify-pin
// @desc    Verify wallet PIN
// @access  Private
router.post('/verify-pin', auth, async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'Invalid PIN' });
    }

    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet || !wallet.hasPinCode) {
      return res.status(400).json({ message: 'No PIN set for wallet' });
    }

    const isValid = await bcrypt.compare(pin, wallet.walletPin);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    res.json({
      success: true,
      message: 'PIN verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= LINK TELEBIRR ACCOUNT =============
// @route   POST /api/wallet/link-telebirr
// @desc    Link Telebirr payment account
// @access  Private
router.post('/link-telebirr', auth, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^(\+251|0)[1-9]\d{8}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Store phone number (generate verification in real implementation)
    await wallet.update({
      telebirrPhoneNumber: phoneNumber,
      telebirrIsVerified: true // In production, would require verification
    });

    res.json({
      success: true,
      message: 'Telebirr account linked successfully',
      data: {
        phoneNumber: phoneNumber.slice(-4),
        isVerified: true
      }
    });
  } catch (error) {
    console.error('Link Telebirr error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= LINK CBE ACCOUNT =============
// @route   POST /api/wallet/link-cbe
// @desc    Link CBE Birr payment account
// @access  Private
router.post('/link-cbe', auth, async (req, res) => {
  try {
    const { phoneNumber, accountNumber } = req.body;

    if (!phoneNumber || !/^(\+251|0)[1-9]\d{8}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    if (!accountNumber || accountNumber.length < 8) {
      return res.status(400).json({ message: 'Invalid account number' });
    }

    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    await wallet.update({
      cbePhoneNumber: phoneNumber,
      cbeAccountNumber: accountNumber,
      cbeIsVerified: true // In production, would require verification
    });

    res.json({
      success: true,
      message: 'CBE account linked successfully',
      data: {
        phoneNumber: phoneNumber.slice(-4),
        accountNumber: accountNumber.slice(-4),
        isVerified: true
      }
    });
  } catch (error) {
    console.error('Link CBE error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= TOP UP WALLET - TELEBIRR =============
// @route   POST /api/wallet/topup/telebirr
// @desc    Initiate Telebirr payment for wallet topup
// @access  Private
router.post('/topup/telebirr', auth, async (req, res) => {
  try {
    const { amount, pin } = req.body;

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < MIN_TOPUP || amountNum > MAX_TOPUP) {
      return res.status(400).json({
        message: `Amount must be between ${MIN_TOPUP} and ${MAX_TOPUP} ETB`
      });
    }

    // Verify PIN
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet || !wallet.hasPinCode) {
      return res.status(400).json({ message: 'Please set wallet PIN first' });
    }

    const pinValid = await bcrypt.compare(pin, wallet.walletPin);
    if (!pinValid) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    // Check daily limit
    const todayTransactions = await Transaction.sum('amount', {
      where: {
        walletId: wallet.id,
        type: 'topup',
        status: 'completed',
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0,0,0,0))
        }
      }
    });

    if ((todayTransactions || 0) + amountNum > DAILY_LIMIT) {
      return res.status(400).json({
        message: `Daily limit of ${DAILY_LIMIT} ETB exceeded`
      });
    }

    if (!wallet.telebirrIsVerified) {
      return res.status(400).json({ message: 'Telebirr account not linked' });
    }

    // Create pending transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      walletId: wallet.id,
      amount: amountNum,
      type: 'topup',
      status: 'pending',
      description: 'Wallet topup via Telebirr',
      reference: `TOPUP-${Date.now()}`
    });

    // Call Telebirr service to generate payment
    const paymentData = await TelebirrService.initiatePayment({
      amount: amountNum,
      phoneNumber: wallet.telebirrPhoneNumber,
      reference: transaction.reference,
      description: 'Fanora Wallet Topup'
    });

    res.status(201).json({
      success: true,
      message: 'Payment initiated',
      data: {
        transactionId: transaction.id,
        reference: transaction.reference,
        amount: amountNum,
        currency: 'ETB',
        paymentUrl: paymentData.paymentUrl,
        qrCode: paymentData.qrCode,
        expiresIn: 900 // 15 minutes
      }
    });
  } catch (error) {
    console.error('Telebirr topup error:', error);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
});

// ============= TOP UP WALLET - CBE =============
// @route   POST /api/wallet/topup/cbe
// @desc    Initiate CBE payment for wallet topup
// @access  Private
router.post('/topup/cbe', auth, async (req, res) => {
  try {
    const { amount, pin } = req.body;

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < MIN_TOPUP || amountNum > MAX_TOPUP) {
      return res.status(400).json({
        message: `Amount must be between ${MIN_TOPUP} and ${MAX_TOPUP} ETB`
      });
    }

    // Verify PIN
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet || !wallet.hasPinCode) {
      return res.status(400).json({ message: 'Please set wallet PIN first' });
    }

    const pinValid = await bcrypt.compare(pin, wallet.walletPin);
    if (!pinValid) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    // Check daily limit
    const todayTransactions = await Transaction.sum('amount', {
      where: {
        walletId: wallet.id,
        type: 'topup',
        status: 'completed',
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0,0,0,0))
        }
      }
    });

    if ((todayTransactions || 0) + amountNum > DAILY_LIMIT) {
      return res.status(400).json({
        message: `Daily limit of ${DAILY_LIMIT} ETB exceeded`
      });
    }

    if (!wallet.cbeIsVerified) {
      return res.status(400).json({ message: 'CBE account not linked' });
    }

    // Create pending transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      walletId: wallet.id,
      amount: amountNum,
      type: 'topup',
      status: 'pending',
      description: 'Wallet topup via CBE',
      reference: `TOPUP-${Date.now()}`
    });

    // Call CBE service to generate payment
    const paymentData = await CBEService.initiatePayment({
      amount: amountNum,
      phoneNumber: wallet.cbePhoneNumber,
      accountNumber: wallet.cbeAccountNumber,
      reference: transaction.reference,
      description: 'Fanora Wallet Topup'
    });

    res.status(201).json({
      success: true,
      message: 'Payment initiated',
      data: {
        transactionId: transaction.id,
        reference: transaction.reference,
        amount: amountNum,
        currency: 'ETB',
        paymentUrl: paymentData.paymentUrl,
        qrCode: paymentData.qrCode,
        expiresIn: 900 // 15 minutes
      }
    });
  } catch (error) {
    console.error('CBE topup error:', error);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
});

// ============= GET WALLET TRANSACTIONS =============
// @route   GET /api/wallet/transactions
// @desc    Get wallet transactions
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Validate enum values
    const validTypes = ['topup', 'withdrawal', 'subscription', 'tip', 'refund', 'commission'];
    const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];

    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Build query with validation
    let whereClause = { walletId: wallet.id };
    if (type && validTypes.includes(type)) {
      whereClause.type = type;
    }
    if (status && validStatuses.includes(status)) {
      whereClause.status = status;
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      offset,
      limit: limitNum
    });

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= REQUEST WITHDRAWAL =============
// @route   POST /api/wallet/withdraw
// @desc    Request wallet withdrawal (Creator only)
// @access  Private (Creator)
router.post('/withdraw', auth, isCreator, async (req, res) => {
  try {
    const { amount, method, pin } = req.body;

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Validate method
    if (!['telebirr', 'cbe'].includes(method)) {
      return res.status(400).json({ message: 'Invalid withdrawal method' });
    }

    // Verify PIN
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet || !wallet.hasPinCode) {
      return res.status(400).json({ message: 'Please set wallet PIN first' });
    }

    const pinValid = await bcrypt.compare(pin, wallet.walletPin);
    if (!pinValid) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    // Check balance
    if (wallet.balance < amountNum) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check account is verified
    if (method === 'telebirr' && !wallet.telebirrIsVerified) {
      return res.status(400).json({ message: 'Telebirr account not verified' });
    }
    if (method === 'cbe' && !wallet.cbeIsVerified) {
      return res.status(400).json({ message: 'CBE account not verified' });
    }

    // Create withdrawal transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      walletId: wallet.id,
      amount: amountNum,
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal to ${method}`,
      reference: `WITHDRAWAL-${Date.now()}`,
      metadata: {
        method,
        manualApprovalRequired: true
      }
    });

    // Deduct from balance (pending approval)
    // In production: deduct only after approval
    // await wallet.decrement('balance', { by: amountNum });

    res.status(201).json({
      success: true,
      message: 'Withdrawal request sent for approval',
      data: {
        transactionId: transaction.id,
        reference: transaction.reference,
        amount: amountNum,
        status: 'pending',
        estimatedProcessingTime: '1-3 business days'
      }
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= GET PAYMENT METHODS =============
// @route   GET /api/wallet/payment-methods
// @desc    Get available payment methods
// @access  Private
router.get('/payment-methods', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.json({
      success: true,
      data: {
        methods: [
          {
            id: 'telebirr',
            name: 'Telebirr',
            icon: 'telebirr',
            isAvailable: true,
            isLinked: wallet.telebirrIsVerified,
            phoneNumber: wallet.telebirrPhoneNumber ? wallet.telebirrPhoneNumber.slice(-4) : null
          },
          {
            id: 'cbe',
            name: 'CBE Birr',
            icon: 'cbe',
            isAvailable: true,
            isLinked: wallet.cbeIsVerified,
            phoneNumber: wallet.cbePhoneNumber ? wallet.cbePhoneNumber.slice(-4) : null,
            accountNumber: wallet.cbeAccountNumber ? wallet.cbeAccountNumber.slice(-4) : null
          }
        ],
        limits: {
          minTopup: MIN_TOPUP,
          maxTopup: MAX_TOPUP,
          dailyLimit: DAILY_LIMIT,
          monthlyLimit: MONTHLY_LIMIT
        }
      }
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;