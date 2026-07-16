const express = require('express');
const { Op } = require('sequelize');
const { ContentBundle, Content, ContentPurchase, Wallet, Transaction, Notification } = require('../models');
const { auth, isCreator, isEmailVerified } = require('../middleware/auth');

const router = express.Router();
const CREATOR_PERCENTAGE = 0.7;

router.get('/creator/:creatorId', async (req, res) => {
  try {
    const bundles = await ContentBundle.findAll({
      where: { creatorId: req.params.creatorId, isActive: true },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: bundles });
  } catch (error) {
    console.error('Get bundles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my', auth, isCreator, async (req, res) => {
  try {
    const bundles = await ContentBundle.findAll({
      where: { creatorId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: bundles });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, isCreator, isEmailVerified, async (req, res) => {
  try {
    const { title, description, price, contentIds = [] } = req.body;
    if (!title || !price || !contentIds.length) {
      return res.status(400).json({ message: 'Title, price, and at least one content item required' });
    }

    const owned = await Content.count({
      where: { id: { [Op.in]: contentIds }, creatorId: req.user.id },
    });
    if (owned !== contentIds.length) {
      return res.status(400).json({ message: 'All content must belong to you' });
    }

    const bundle = await ContentBundle.create({
      creatorId: req.user.id,
      title,
      description: description || '',
      price: parseFloat(price),
      contentIds,
    });

    res.status(201).json({ success: true, data: bundle });
  } catch (error) {
    console.error('Create bundle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, isCreator, async (req, res) => {
  try {
    const bundle = await ContentBundle.findByPk(req.params.id);
    if (!bundle || bundle.creatorId !== req.user.id) {
      return res.status(404).json({ message: 'Bundle not found' });
    }
    const { title, description, price, contentIds, isActive } = req.body;
    if (title) bundle.title = title;
    if (description !== undefined) bundle.description = description;
    if (price) bundle.price = parseFloat(price);
    if (contentIds) bundle.contentIds = contentIds;
    if (isActive !== undefined) bundle.isActive = isActive;
    await bundle.save();
    res.json({ success: true, data: bundle });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, isCreator, async (req, res) => {
  try {
    const bundle = await ContentBundle.findByPk(req.params.id);
    if (!bundle || bundle.creatorId !== req.user.id) {
      return res.status(404).json({ message: 'Bundle not found' });
    }
    await bundle.destroy();
    res.json({ success: true, message: 'Bundle deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/purchase', auth, isEmailVerified, async (req, res) => {
  try {
    const { pin } = req.body;
    const bundle = await ContentBundle.findByPk(req.params.id);
    if (!bundle || !bundle.isActive) {
      return res.status(404).json({ message: 'Bundle not found' });
    }

    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    if (pin && !(await wallet.verifyPin(pin))) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    const price = parseFloat(bundle.price);
    if (parseFloat(wallet.balance) < price) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    const existing = await ContentPurchase.findAll({
      where: { userId: req.user.id, contentId: { [Op.in]: bundle.contentIds } },
    });
    const alreadyOwned = new Set(existing.map((p) => p.contentId));
    const toPurchase = bundle.contentIds.filter((id) => !alreadyOwned.has(id));

    await wallet.decrement('balance', { by: price });

    const transaction = await Transaction.create({
      userId: req.user.id,
      walletId: wallet.id,
      amount: price,
      type: 'content_purchase',
      status: 'completed',
      description: `Bundle: ${bundle.title}`,
    });

    for (const contentId of toPurchase) {
      await ContentPurchase.create({
        userId: req.user.id,
        contentId,
        amount: price / bundle.contentIds.length,
        transactionId: transaction.id,
      });
    }

    bundle.purchaseCount += 1;
    await bundle.save();

    const creatorWallet = await Wallet.findOne({ where: { userId: bundle.creatorId } });
    if (creatorWallet) {
      await creatorWallet.increment('balance', { by: price * CREATOR_PERCENTAGE });
    }

    await Notification.create({
      userId: bundle.creatorId,
      type: 'purchase',
      title: 'Bundle purchased',
      message: `${req.user.username} purchased your bundle "${bundle.title}"`,
      relatedUserId: req.user.id,
    });

    res.json({
      success: true,
      message: 'Bundle unlocked',
      data: { bundleId: bundle.id, unlockedContentIds: toPurchase },
    });
  } catch (error) {
    console.error('Purchase bundle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
