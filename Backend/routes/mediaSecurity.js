const express = require('express');
const { Content, MediaSecurityEvent, Notification } = require('../models');
const { auth, isCreator } = require('../middleware/auth');

const router = express.Router();

router.get('/watermark/:contentId', auth, async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.contentId);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json({
      success: true,
      data: {
        label: `@${req.user.username} · ${req.user.id.slice(0, 8)}`,
        opacity: 0.14,
        rotation: -24,
        tile: true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/event', auth, async (req, res) => {
  try {
    const { contentId, eventType, platform, metadata } = req.body;
    if (!['screenshot', 'screen_recording'].includes(eventType)) {
      return res.status(400).json({ message: 'Invalid security event type' });
    }
    const content = await Content.findByPk(contentId);
    if (!content) return res.status(404).json({ message: 'Content not found' });

    const event = await MediaSecurityEvent.create({
      userId: req.user.id,
      creatorId: content.creatorId,
      contentId,
      eventType,
      platform: platform || 'unknown',
      metadata: metadata || {},
    });
    if (content.creatorId !== req.user.id) {
      await Notification.create({
        userId: content.creatorId,
        type: 'screenshot_alert',
        relatedUserId: req.user.id,
        relatedContentId: content.id,
        title: eventType === 'screenshot' ? 'Screenshot detected' : 'Screen recording detected',
        message: `A viewer captured "${content.title}"`,
        data: { eventId: event.id, deepLink: `/content/${content.id}` },
      });
    }
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Media security event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/events', auth, isCreator, async (req, res) => {
  try {
    const events = await MediaSecurityEvent.findAll({
      where: { creatorId: req.user.id },
      include: [{ model: Content, as: 'content', attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
