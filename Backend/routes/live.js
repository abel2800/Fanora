const express = require('express');
const { auth, isCreator, isEmailVerified, optionalAuth } = require('../middleware/auth');
const { LiveStream, User } = require('../models');
const { createLiveInput, disableLiveInput } = require('../services/liveProvider');

const router = express.Router();

// @route   POST /api/live/start
router.post('/start', auth, isCreator, isEmailVerified, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const existing = await LiveStream.findOne({
      where: { creatorId: req.user.id, status: 'live' },
    });
    if (existing) {
      return res.status(409).json({ message: 'You already have an active live stream', data: existing });
    }

    const input = await createLiveInput();
    const stream = await LiveStream.create({
      creatorId: req.user.id,
      title,
      description: description || '',
      provider: input.provider,
      providerStreamId: input.providerStreamId,
      streamKey: input.streamKey,
      ingestUrl: input.ingestUrl,
      playbackUrl: input.playbackUrl,
      metadata: input.metadata,
      status: 'live',
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Live stream started',
      data: {
        ...stream.toJSON(),
        ingestUrl: `${stream.ingestUrl}/${stream.streamKey}`,
      },
    });
  } catch (error) {
    console.error('Start live error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/live
router.get('/', optionalAuth, async (req, res) => {
  try {
    const streams = await LiveStream.findAll({
      where: { status: 'live' },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'profileImage', 'isVerified'],
      }],
      attributes: { exclude: ['streamKey'] },
      order: [['startedAt', 'DESC']],
    });
    res.json({ success: true, data: streams });
  } catch (error) {
    console.error('List live error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/live/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const stream = await LiveStream.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'profileImage', 'isVerified'],
      }],
      attributes: { exclude: ['streamKey'] },
    });
    if (!stream) {
      return res.status(404).json({ message: 'Live stream not found' });
    }
    res.json({ success: true, data: stream });
  } catch (error) {
    console.error('Get live error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/live/:id/end
router.post('/:id/end', auth, isCreator, async (req, res) => {
  try {
    const stream = await LiveStream.findByPk(req.params.id);
    if (!stream) {
      return res.status(404).json({ message: 'Live stream not found' });
    }
    if (stream.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await disableLiveInput(stream);
    stream.status = 'ended';
    stream.endedAt = new Date();
    await stream.save();
    res.json({ success: true, message: 'Live stream ended', data: stream });
  } catch (error) {
    console.error('End live error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Provider webhooks update stream state and viewer metrics.
router.post('/webhooks/provider', async (req, res) => {
  try {
    const providerStreamId = req.body?.data?.id || req.body?.uid || req.body?.streamId;
    if (!providerStreamId) return res.status(400).json({ message: 'Missing provider stream id' });

    const stream = await LiveStream.findOne({ where: { providerStreamId } });
    if (!stream) return res.status(202).json({ success: true });

    const event = req.body.type || req.body.event || req.body.status;
    if (/connected|active|live/i.test(event)) stream.status = 'live';
    if (/disconnected|idle|ended|disabled/i.test(event)) {
      stream.status = 'ended';
      stream.endedAt = new Date();
    }
    if (Number.isInteger(req.body.viewerCount)) stream.viewerCount = req.body.viewerCount;
    await stream.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Live webhook error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
