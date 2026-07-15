const express = require('express');
const { Op } = require('sequelize');
const { Story, User } = require('../models');
const { auth, isCreator, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const STORY_DURATION_HOURS = 24;

// @route   GET /api/stories
router.get('/', optionalAuth, async (req, res) => {
  try {
    const now = new Date();
    const stories = await Story.findAll({
      where: {
        status: 'published',
        expiresAt: { [Op.gt]: now },
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage', 'isVerified'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const grouped = stories.reduce((acc, story) => {
      const creatorId = story.creatorId;
      if (!acc[creatorId]) {
        acc[creatorId] = {
          creator: story.creator,
          stories: [],
        };
      }
      acc[creatorId].stories.push(story);
      return acc;
    }, {});

    res.json({ success: true, data: Object.values(grouped) });
  } catch (error) {
    console.error('Get stories feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/stories
router.post('/', auth, isCreator, async (req, res) => {
  try {
    const { mediaUrl, mediaType = 'image', duration = 5 } = req.body;

    if (!mediaUrl) {
      return res.status(400).json({ message: 'Media URL is required' });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + STORY_DURATION_HOURS);

    const story = await Story.create({
      creatorId: req.user.id,
      mediaUrl,
      mediaType,
      duration,
      expiresAt,
      status: 'published',
    });

    res.status(201).json({ success: true, data: story });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/stories/creator/:creatorId
router.get('/creator/:creatorId', optionalAuth, async (req, res) => {
  try {
    const now = new Date();
    const stories = await Story.findAll({
      where: {
        creatorId: req.params.creatorId,
        status: 'published',
        expiresAt: { [Op.gt]: now },
      },
      order: [['createdAt', 'ASC']],
    });

    res.json({ success: true, data: stories });
  } catch (error) {
    console.error('Get creator stories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/stories/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'profileImage'],
        },
      ],
    });

    if (!story || story.status !== 'published' || new Date(story.expiresAt) <= new Date()) {
      return res.status(404).json({ message: 'Story not found or expired' });
    }

    const viewers = story.viewers || [];
    if (!viewers.includes(req.user.id)) {
      await story.update({
        viewers: [...viewers, req.user.id],
        viewsCount: story.viewsCount + 1,
      });
    }

    res.json({ success: true, data: story });
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/stories/:id
router.delete('/:id', auth, isCreator, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await story.update({ status: 'archived' });
    res.json({ success: true, message: 'Story deleted' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
