const express = require('express');
const { Op } = require('sequelize');
const { User, Wallet, Transaction, Notification } = require('../models');
const { auth, isEmailVerified } = require('../middleware/auth');

const router = express.Router();

const PLATFORM_FEE_PERCENTAGE = 0.30;
const CREATOR_PERCENTAGE = 0.70;

// @route   POST /api/tips/send/:creatorId
router.post('/send/:creatorId', auth, isEmailVerified, async (req, res) => {
  try {
    const { amount, message } = req.body;
    const tipAmount = parseFloat(amount);

    if (!tipAmount || tipAmount < 10) {
      return res.status(400).json({ message: 'Minimum tip amount is 10 ETB' });
    }

    const creator = await User.findByPk(req.params.creatorId);
    if (!creator || !creator.isCreator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    if (creator.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot tip yourself' });
    }

    const senderWallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!senderWallet || parseFloat(senderWallet.balance) < tipAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    const platformFee = tipAmount * PLATFORM_FEE_PERCENTAGE;
    const creatorAmount = tipAmount * CREATOR_PERCENTAGE;

    await senderWallet.deductFunds(tipAmount, `Tip to @${creator.username}`);

    const senderTransaction = await Transaction.create({
      userId: req.user.id,
      walletId: senderWallet.id,
      amount: tipAmount,
      type: 'tip',
      status: 'completed',
      description: `Tip to @${creator.username}`,
      paymentMethodType: 'wallet_transfer',
      platformFee,
      completedAt: new Date(),
      metadata: {
        recipientId: creator.id,
        message: message || '',
        direction: 'sent',
      },
    });

    const creatorWallet = await Wallet.findOne({ where: { userId: creator.id } });
    if (creatorWallet) {
      await creatorWallet.addFunds(creatorAmount, `Tip from @${req.user.username}`);

      await Transaction.create({
        userId: creator.id,
        walletId: creatorWallet.id,
        amount: creatorAmount,
        type: 'tip',
        status: 'completed',
        description: `Tip from @${req.user.username}`,
        paymentMethodType: 'wallet_transfer',
        platformFee: 0,
        completedAt: new Date(),
        metadata: {
          senderId: req.user.id,
          message: message || '',
          direction: 'received',
          relatedTransactionId: senderTransaction.id,
        },
      });
    }

    await Notification.create({
      userId: creator.id,
      type: 'tip_received',
      relatedUserId: req.user.id,
      title: 'Tip received',
      message: `${req.user.username} sent you ${tipAmount} ETB`,
      data: { amount: tipAmount, message: message || '' },
    });

    res.status(201).json({
      success: true,
      message: 'Tip sent successfully',
      data: {
        amount: tipAmount,
        creatorAmount,
        platformFee,
        transactionId: senderTransaction.id,
      },
    });
  } catch (error) {
    console.error('Send tip error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   GET /api/tips/sent
router.get('/sent', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Transaction.findAndCountAll({
      where: {
        userId: req.user.id,
        type: 'tip',
        metadata: { [Op.contains]: { direction: 'sent' } },
      },
      order: [['createdAt', 'DESC']],
      offset,
      limit: limitNum,
    });

    const enriched = await Promise.all(
      rows.map(async (tip) => {
        const creator = tip.metadata?.recipientId
          ? await User.findByPk(tip.metadata.recipientId, {
              attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
            })
          : null;
        return { ...tip.toJSON(), creator };
      })
    );

    res.json({
      success: true,
      data: enriched,
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
    });
  } catch (error) {
    console.error('Get tips sent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tips/received
router.get('/received', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Transaction.findAndCountAll({
      where: {
        userId: req.user.id,
        type: 'tip',
        metadata: { [Op.contains]: { direction: 'received' } },
      },
      order: [['createdAt', 'DESC']],
      offset,
      limit: limitNum,
    });

    const enriched = await Promise.all(
      rows.map(async (tip) => {
        const sender = tip.metadata?.senderId
          ? await User.findByPk(tip.metadata.senderId, {
              attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
            })
          : null;
        return { ...tip.toJSON(), sender };
      })
    );

    res.json({
      success: true,
      data: enriched,
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
    });
  } catch (error) {
    console.error('Get tips received error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tips/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const sent = await Transaction.sum('amount', {
      where: { userId: req.user.id, type: 'tip', metadata: { [Op.contains]: { direction: 'sent' } }, status: 'completed' },
    });

    const received = await Transaction.sum('amount', {
      where: { userId: req.user.id, type: 'tip', metadata: { [Op.contains]: { direction: 'received' } }, status: 'completed' },
    });

    res.json({
      success: true,
      data: {
        totalSent: parseFloat(sent || 0),
        totalReceived: parseFloat(received || 0),
      },
    });
  } catch (error) {
    console.error('Get tip stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tips/history
router.get('/history', auth, async (req, res) => {
  try {
    const tips = await Transaction.findAll({
      where: {
        userId: req.user.id,
        type: 'tip',
      },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    res.json({ success: true, data: tips });
  } catch (error) {
    console.error('Get tip history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
