const express = require('express');
const { CustomRequest, User, Wallet, Notification, sequelize } = require('../models');
const { auth, isCreator } = require('../middleware/auth');

const router = express.Router();

router.get('/mine', auth, async (req, res) => {
  try {
    const requests = await CustomRequest.findAll({
      where: { fanId: req.user.id },
      include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'profileImage'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Get fan requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/inbox', auth, isCreator, async (req, res) => {
  try {
    const requests = await CustomRequest.findAll({
      where: { creatorId: req.user.id },
      include: [{ model: User, as: 'fan', attributes: ['id', 'username', 'profileImage', 'settings'] }],
      order: [['createdAt', 'DESC']],
    });
    const masked = requests.map((request) => {
      const json = request.toJSON();
      const privacy = json.fan?.settings?.privacy || {};
      if (privacy.incognitoMode) {
        json.fan = { id: json.fan.id, username: privacy.disguisedDisplayName || 'Fan', isIncognito: true };
      }
      return json;
    });
    res.json({ success: true, data: masked });
  } catch (error) {
    console.error('Get request inbox error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { creatorId, description, offeredPrice, dueAt } = req.body;
    if (!creatorId || !description?.trim() || !Number(offeredPrice)) {
      return res.status(400).json({ message: 'Creator, request, and offered price are required' });
    }
    const creator = await User.findOne({ where: { id: creatorId, isCreator: true } });
    if (!creator) return res.status(404).json({ message: 'Creator not found' });

    const request = await CustomRequest.create({
      fanId: req.user.id,
      creatorId,
      description: description.trim(),
      offeredPrice: Number(offeredPrice),
      dueAt: dueAt || null,
    });
    await Notification.create({
      userId: creatorId,
      type: 'custom_request',
      relatedUserId: req.user.id,
      title: 'New custom request',
      message: 'A fan sent you a custom content request',
      data: { requestId: request.id, deepLink: `/creator/requests/${request.id}` },
    });
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error('Create custom request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/respond', auth, isCreator, async (req, res) => {
  try {
    const request = await CustomRequest.findOne({
      where: { id: req.params.id, creatorId: req.user.id },
    });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const { action, counterPrice } = req.body;
    if (!['accept', 'counter', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }
    request.status = action === 'accept' ? 'accepted' : action === 'counter' ? 'countered' : 'declined';
    if (action === 'counter') {
      if (!Number(counterPrice)) return res.status(400).json({ message: 'Counter price is required' });
      request.counterPrice = Number(counterPrice);
    }
    await request.save();
    await Notification.create({
      userId: request.fanId,
      type: 'custom_request_update',
      relatedUserId: req.user.id,
      title: 'Custom request updated',
      message: `Your request was ${request.status}`,
      data: { requestId: request.id, deepLink: '/requests' },
    });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/pay', auth, async (req, res) => {
  try {
    const request = await CustomRequest.findOne({
      where: { id: req.params.id, fanId: req.user.id },
    });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (!['accepted', 'countered'].includes(request.status)) {
      return res.status(400).json({ message: 'Request is not ready for payment' });
    }
    if (request.paymentStatus === 'paid') return res.json({ success: true, data: request });

    const amount = Number(request.counterPrice || request.offeredPrice);
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    const creatorWallet = await Wallet.findOne({ where: { userId: request.creatorId } });
    if (!wallet || Number(wallet.balance) < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    if (req.body.pin && !(await wallet.verifyPin(req.body.pin))) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    await sequelize.transaction(async (transaction) => {
      await wallet.decrement('balance', { by: amount, transaction });
      if (creatorWallet) await creatorWallet.increment('balance', { by: amount * 0.7, transaction });
      await request.update({
        status: 'accepted',
        paymentStatus: 'paid',
        paidAt: new Date(),
      }, { transaction });
    });
    await Notification.create({
      userId: request.creatorId,
      type: 'custom_request_update',
      relatedUserId: req.user.id,
      title: 'Custom request paid',
      message: 'You can now create and deliver the requested content',
      data: { requestId: request.id, deepLink: '/creator/requests' },
    });
    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Pay custom request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/deliver', auth, isCreator, async (req, res) => {
  try {
    const request = await CustomRequest.findOne({
      where: {
        id: req.params.id,
        creatorId: req.user.id,
        status: 'accepted',
        paymentStatus: 'paid',
      },
    });
    if (!request) return res.status(404).json({ message: 'Accepted request not found' });
    request.status = 'delivered';
    request.deliveryContentId = req.body.contentId || null;
    await request.save();
    await Notification.create({
      userId: request.fanId,
      type: 'custom_request_update',
      relatedUserId: req.user.id,
      relatedContentId: request.deliveryContentId,
      title: 'Your custom request is ready',
      message: 'The creator delivered your request',
      data: {
        requestId: request.id,
        deepLink: request.deliveryContentId ? `/content/${request.deliveryContentId}` : '/requests',
      },
    });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
