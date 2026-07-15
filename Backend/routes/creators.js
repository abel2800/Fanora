const express = require('express');
const { Op } = require('sequelize');
const { User, Content, SubscriptionPlan, UserSubscription, Transaction, Wallet, sequelize } = require('../models');
const { auth, isEmailVerified } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/creators/apply
// @desc    Apply to become a creator
// @access  Private
router.post('/apply', auth, isEmailVerified, async (req, res) => {
  try {
    if (req.user.isCreator) {
      return res.status(400).json({ message: 'You are already a creator' });
    }

    // For now, auto-approve creator applications
    req.user.isCreator = true;
    req.user.role = 'creator';
    await req.user.save();

    res.json({ 
      message: 'Creator application approved! You can now create content and subscription plans.' 
    });
  } catch (error) {
    console.error('Creator application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/creators
// @desc    Get all creators
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = { isCreator: true, isVerified: true };

    // Sanitize search parameter
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = search.trim().substring(0, 100);
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${searchTerm}%` } },
        { firstName: { [Op.iLike]: `%${searchTerm}%` } },
        { lastName: { [Op.iLike]: `%${searchTerm}%` } }
      ];
    }

    const { count, rows: creators } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage', 'bio', 'isVerified'],
      offset,
      limit: limitNum,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      creators,
      pagination: {
        current: pageNum,
        pages: Math.ceil(count / limitNum),
        total: count
      }
    });
  } catch (error) {
    console.error('Get creators error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/creators/:creatorId/dashboard
// @desc    Get creator dashboard data
// @access  Private (Creator only)
router.get('/:creatorId/dashboard', auth, async (req, res) => {
  try {
    const { creatorId } = req.params;

    if (creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.user.isCreator) {
      return res.status(403).json({ message: 'Creator access required' });
    }

    const [
      totalContent,
      contentStats,
      totalPlans,
      activeSubscribers,
      totalEarnings,
      recentContent,
      followersCount,
      followingCount,
    ] = await Promise.all([
      Content.count({ where: { creatorId: req.user.id } }),
      Content.findAll({
        where: { creatorId: req.user.id },
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('views_count')), 0), 'totalViews'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('likes_count')), 0), 'totalLikes'],
        ],
        raw: true,
      }),
      SubscriptionPlan.count({ where: { creatorId: req.user.id } }),
      (async () => {
        const plans = await SubscriptionPlan.findAll({
          where: { creatorId: req.user.id },
          attributes: ['id'],
        });
        const planIds = plans.map((plan) => plan.id);
        if (!planIds.length) return 0;
        return UserSubscription.count({
          where: { planId: { [Op.in]: planIds }, status: 'active' },
        });
      })(),
      Transaction.sum('amount', {
        where: {
          userId: req.user.id,
          type: 'tip',
          status: 'completed',
        },
      }),
      Content.findAll({
        where: { creatorId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'title', 'viewsCount', 'likesCount', 'createdAt', 'thumbnailUrl'],
      }),
      req.user.countFollowers(),
      req.user.countFollowing(),
    ]);

    const contentAggregate = contentStats[0] || { totalViews: 0, totalLikes: 0 };

    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });

    const dashboard = {
      content: {
        totalContent,
        totalViews: parseInt(contentAggregate.totalViews || 0, 10),
        totalLikes: parseInt(contentAggregate.totalLikes || 0, 10),
        totalRevenue: parseFloat(wallet?.balance || 0),
      },
      subscriptions: {
        totalPlans,
        activePlans: await SubscriptionPlan.count({ where: { creatorId: req.user.id, isActive: true } }),
        totalSubscribers: activeSubscribers,
        monthlyRevenue: parseFloat(totalEarnings || 0),
      },
      recentContent,
      profile: {
        followers: followersCount,
        following: followingCount,
        isVerified: req.user.isVerified,
      },
    };

    res.json({ dashboard });
  } catch (error) {
    console.error('Get creator dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;