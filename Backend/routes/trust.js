const express = require('express');
const { TrustReport, User } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/reports', auth, async (req, res) => {
  try {
    const reports = await TrustReport.findAll({
      where: { reporterId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/report', auth, async (req, res) => {
  try {
    const { type, reason, targetUserId, targetContentId } = req.body;
    if (!type || !reason) {
      return res.status(400).json({ message: 'Type and reason are required' });
    }
    const report = await TrustReport.create({
      reporterId: req.user.id,
      type,
      reason,
      targetUserId: targetUserId || null,
      targetContentId: targetContentId || null,
    });
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/blocked', auth, async (req, res) => {
  try {
    const settings = req.user.settings || {};
    const blocked = settings.blockedUsers || [];
    const users = blocked.length
      ? await User.findAll({ where: { id: blocked }, attributes: ['id', 'username', 'profileImage'] })
      : [];
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/block/:userId', auth, async (req, res) => {
  try {
    const settings = req.user.settings || {};
    const blocked = new Set(settings.blockedUsers || []);
    blocked.add(req.params.userId);
    req.user.settings = { ...settings, blockedUsers: [...blocked] };
    await req.user.save();
    res.json({ success: true, message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/block/:userId', auth, async (req, res) => {
  try {
    const settings = req.user.settings || {};
    const blocked = (settings.blockedUsers || []).filter((id) => id !== req.params.userId);
    req.user.settings = { ...settings, blockedUsers: blocked };
    await req.user.save();
    res.json({ success: true, message: 'User unblocked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
