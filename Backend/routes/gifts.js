const express = require('express');
const crypto = require('crypto');
const {
  GiftVoucher, SubscriptionPlan, UserSubscription, User, Wallet, Notification,
} = require('../models');
const { auth, isEmailVerified } = require('../middleware/auth');
const { sendSms } = require('../services/sms');

const router = express.Router();

const makeCode = () => `FN-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

router.get('/mine', auth, async (req, res) => {
  try {
    const vouchers = await GiftVoucher.findAll({
      where: { purchaserId: req.user.id },
      include: [{ model: SubscriptionPlan, as: 'plan' }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: vouchers });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, isEmailVerified, async (req, res) => {
  try {
    const { planId, recipientPhone, pin } = req.body;
    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan || !plan.isActive) return res.status(404).json({ message: 'Plan not found' });

    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    if (pin && !(await wallet.verifyPin(pin))) return res.status(401).json({ message: 'Invalid PIN' });
    const amount = Number(plan.price);
    if (Number(wallet.balance) < amount) return res.status(400).json({ message: 'Insufficient wallet balance' });

    await wallet.decrement('balance', { by: amount });
    const creatorWallet = await Wallet.findOne({ where: { userId: plan.creatorId } });
    if (creatorWallet) await creatorWallet.increment('balance', { by: amount * 0.7 });

    const voucher = await GiftVoucher.create({
      code: makeCode(),
      purchaserId: req.user.id,
      planId,
      recipientPhone: recipientPhone || null,
      amount,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });

    if (recipientPhone) {
      await sendSms({
        to: recipientPhone,
        message: `${req.user.username} gifted you a Fanora subscription. Redeem code ${voucher.code}.`,
      }).catch((error) => console.error('Gift SMS failed:', error.message));
    }

    res.status(201).json({ success: true, data: voucher });
  } catch (error) {
    console.error('Gift subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/redeem', auth, async (req, res) => {
  try {
    const voucher = await GiftVoucher.findOne({ where: { code: String(req.body.code || '').toUpperCase() } });
    if (!voucher || voucher.status !== 'active') return res.status(404).json({ message: 'Invalid gift code' });
    if (voucher.expiresAt < new Date()) {
      voucher.status = 'expired';
      await voucher.save();
      return res.status(400).json({ message: 'Gift code expired' });
    }

    const plan = await SubscriptionPlan.findByPk(voucher.planId);
    if (!plan) return res.status(404).json({ message: 'Subscription plan no longer exists' });
    const existing = await UserSubscription.findOne({
      where: { userId: req.user.id, planId: plan.id, status: 'active' },
    });
    if (existing) return res.status(409).json({ message: 'You already have this subscription' });

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (plan.durationInDays || 30));
    const subscription = await UserSubscription.create({
      userId: req.user.id,
      planId: plan.id,
      endDate,
      nextBillingDate: null,
      autoRenewal: false,
      status: 'active',
    });
    voucher.status = 'redeemed';
    voucher.recipientId = req.user.id;
    voucher.redeemedAt = new Date();
    await voucher.save();
    await plan.increment('activeSubscribers');

    await Notification.create({
      userId: plan.creatorId,
      type: 'new_subscriber',
      relatedUserId: req.user.id,
      title: 'Gift subscription redeemed',
      message: `${req.user.username} redeemed a gift subscription`,
      data: { deepLink: '/creator/subscribers' },
    });
    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error('Redeem gift error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
