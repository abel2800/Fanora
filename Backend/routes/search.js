const express = require('express');
const { Op } = require('sequelize');
const { User, Content } = require('../models');

const router = express.Router();

// @route   GET /api/search
router.get('/', async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 20 } = req.query;

    if (!q || !q.trim()) {
      return res.json({ success: true, data: { creators: [], content: [] } });
    }

    const searchTerm = q.trim().substring(0, 100);
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let creators = [];
    let content = [];

    if (type === 'all' || type === 'creators') {
      const creatorResult = await User.findAndCountAll({
        where: {
          isCreator: true,
          [Op.or]: [
            { username: { [Op.iLike]: `%${searchTerm}%` } },
            { firstName: { [Op.iLike]: `%${searchTerm}%` } },
            { lastName: { [Op.iLike]: `%${searchTerm}%` } },
            { bio: { [Op.iLike]: `%${searchTerm}%` } },
          ],
        },
        attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage', 'bio', 'isVerified'],
        offset,
        limit: limitNum,
        order: [['createdAt', 'DESC']],
      });
      creators = creatorResult.rows;
    }

    if (type === 'all' || type === 'content') {
      const contentResult = await Content.findAndCountAll({
        where: {
          status: 'published',
          [Op.or]: [
            { title: { [Op.iLike]: `%${searchTerm}%` } },
            { description: { [Op.iLike]: `%${searchTerm}%` } },
            { tags: { [Op.contains]: [searchTerm.toLowerCase()] } },
          ],
        },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'profileImage', 'isVerified'],
          },
        ],
        offset,
        limit: limitNum,
        order: [['createdAt', 'DESC']],
      });
      content = contentResult.rows;
    }

    res.json({
      success: true,
      data: { creators, content },
      query: searchTerm,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
