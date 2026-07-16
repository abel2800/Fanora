const express = require('express');
const { WishlistItem, Content, User } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await WishlistItem.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Content,
        as: 'content',
        attributes: { exclude: ['mediaUrl'] },
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'profileImage', 'isVerified'],
        }],
      }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:contentId/status', auth, async (req, res) => {
  try {
    const count = await WishlistItem.count({
      where: { userId: req.user.id, contentId: req.params.contentId },
    });
    res.json({ success: true, saved: count > 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:contentId', auth, async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.contentId);
    if (!content || content.status !== 'published') {
      return res.status(404).json({ message: 'Content not found' });
    }
    const [item, created] = await WishlistItem.findOrCreate({
      where: { userId: req.user.id, contentId: content.id },
      defaults: { userId: req.user.id, contentId: content.id },
    });
    res.status(created ? 201 : 200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:contentId', auth, async (req, res) => {
  try {
    await WishlistItem.destroy({
      where: { userId: req.user.id, contentId: req.params.contentId },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
