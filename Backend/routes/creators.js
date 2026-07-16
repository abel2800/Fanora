const express = require('express');
const { Op } = require('sequelize');
const {
  User, Content, SubscriptionPlan, UserSubscription, Transaction,
  Wallet, CreatorReferral, CreatorVerification, sequelize,
} = require('../models');
const { auth, isEmailVerified, isCreator } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/creators/apply
// @desc    Apply to become a creator
// @access  Private
router.post('/apply', auth, isEmailVerified, async (req, res) => {
  try {
    if (req.user.isCreator) {
      return res.status(400).json({ message: 'You are already a creator' });
    }

    const [verification] = await CreatorVerification.findOrCreate({
      where: { userId: req.user.id },
      defaults: { userId: req.user.id, status: 'draft', currentStep: 1 },
    });
    res.json({
      success: true,
      message: 'Complete creator verification to continue',
      data: verification,
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

// @route   GET /api/creators/me/insights
router.get('/me/insights', auth, isCreator, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const plans = await SubscriptionPlan.findAll({ where: { creatorId: req.user.id }, attributes: ['id'] });
    const planIds = plans.map((p) => p.id);

    const [activeSubs, cancelledSubs, topContent, tips] = await Promise.all([
      UserSubscription.count({ where: { planId: { [Op.in]: planIds }, status: 'active' } }),
      UserSubscription.findAll({
        where: { planId: { [Op.in]: planIds }, status: 'cancelled', cancelledAt: { [Op.gte]: startDate } },
        attributes: ['cancellationReason'],
        limit: 100,
      }),
      Content.findAll({
        where: { creatorId: req.user.id, createdAt: { [Op.gte]: startDate } },
        attributes: ['id', 'title', 'type', 'viewsCount', 'likesCount', 'accessType'],
        order: [['viewsCount', 'DESC']],
        limit: 10,
      }),
      Transaction.sum('amount', {
        where: { userId: req.user.id, type: 'tip', status: 'completed', createdAt: { [Op.gte]: startDate } },
      }),
    ]);

    const churnReasons = cancelledSubs.reduce((acc, s) => {
      const reason = s.cancellationReason || 'No reason given';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});

    const retentionByWeek = [];
    for (let w = 0; w < 4; w++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      const count = await UserSubscription.count({
        where: {
          planId: { [Op.in]: planIds },
          status: 'active',
          startDate: { [Op.lte]: weekEnd },
        },
      });
      retentionByWeek.unshift({ week: `W${4 - w}`, subscribers: count });
    }

    res.json({
      success: true,
      data: {
        activeSubscribers: activeSubs,
        tipsRevenue: parseFloat(tips || 0),
        topContent,
        churnReasons,
        retentionCurve: retentionByWeek,
        bestContentType: topContent[0]?.type || 'image',
      },
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/creators/me/referral
router.get('/me/referral', auth, isCreator, async (req, res) => {
  try {
    if (!req.user.referralCode) {
      req.user.referralCode = `FN${req.user.username.slice(0, 6).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;
      await req.user.save();
    }
    const referrals = await CreatorReferral.findAll({
      where: { referrerId: req.user.id },
      include: [{ model: User, as: 'referredCreator', attributes: ['id', 'username', 'createdAt'] }],
      order: [['createdAt', 'DESC']],
    });
    const totalBonus = referrals.reduce((sum, r) => sum + parseFloat(r.bonusEarned || 0), 0);
    res.json({
      success: true,
      data: {
        referralCode: req.user.referralCode,
        referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/signup?ref=${req.user.referralCode}`,
        referrals,
        totalBonus,
        qualifiedCount: referrals.filter((r) => r.status === 'qualified' || r.status === 'paid').length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/creators/referral/apply
router.post('/referral/apply', auth, async (req, res) => {
  try {
    const { referralCode } = req.body;
    if (!referralCode) return res.status(400).json({ message: 'Referral code required' });
    const referrer = await User.findOne({ where: { referralCode } });
    if (!referrer) return res.status(404).json({ message: 'Invalid referral code' });
    const existing = await CreatorReferral.findOne({ where: { referredCreatorId: req.user.id } });
    if (existing) return res.status(400).json({ message: 'Referral already applied' });
    await CreatorReferral.create({
      referrerId: referrer.id,
      referredCreatorId: req.user.id,
      referralCode,
      status: 'pending',
    });
    res.json({ success: true, message: 'Referral applied' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;