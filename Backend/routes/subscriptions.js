const express = require('express');
const { Op } = require('sequelize');
const { User, SubscriptionPlan, UserSubscription, Wallet, Transaction, Notification } = require('../models');
const { auth, isCreator, isEmailVerified } = require('../middleware/auth');

const router = express.Router();

const PLATFORM_FEE_PERCENTAGE = 0.30; // Platform gets 30%
const CREATOR_PERCENTAGE = 0.70; // Creator gets 70%

// ============= CREATE SUBSCRIPTION PLAN =============
// @route   POST /api/subscriptions/plans
// @desc    Create subscription plan (Creator only)
// @access  Private (Creator)
router.post('/plans', auth, isCreator, isEmailVerified, async (req, res) => {
  try {
    const { name, description, price, durationInDays, duration, benefits, features, isPublic } = req.body;

    // Validation
    if (!name || !price || (!durationInDays && !duration)) {
      return res.status(400).json({ message: 'Name, price, and duration are required' });
    }

    if (parseFloat(price) <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    const days = parseInt(durationInDays) || 30;
    if (days <= 0) {
      return res.status(400).json({ message: 'Duration must be greater than 0' });
    }

    const durationMap = { 7: 'weekly', 30: 'monthly', 90: 'quarterly', 365: 'yearly' };
    const resolvedDuration = duration || durationMap[days] || 'monthly';
    const planFeatures = features || benefits || [];

    const plan = await SubscriptionPlan.create({
      creatorId: req.user.id,
      name,
      description: description || '',
      price: parseFloat(price),
      currency: 'ETB',
      duration: resolvedDuration,
      durationInDays: days,
      features: typeof planFeatures === 'string' ? JSON.parse(planFeatures) : planFeatures,
      isPublic: isPublic !== 'false',
      isActive: true,
      activeSubscribers: 0
    });

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: plan
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= GET CREATOR'S PLANS =============
// @route   GET /api/subscriptions/plans/creator/:creatorId
// @desc    Get creator's subscription plans
// @access  Public
router.get('/plans/creator/:creatorId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: plans } = await SubscriptionPlan.findAndCountAll({
      where: {
        creatorId: req.params.creatorId,
        isPublic: true,
        isActive: true
      },
      include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'profileImage', 'isVerified'] }],
      order: [['price', 'ASC']],
      offset,
      limit: limitNum,
      distinct: true
    });

    res.json({
      success: true,
      data: plans,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Get creator plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= GET MY PLANS =============
// @route   GET /api/subscriptions/plans/my
// @desc    Get my subscription plans (Creator only)
// @access  Private (Creator)
router.get('/plans/my', auth, isCreator, async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { creatorId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get my plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= UPDATE SUBSCRIPTION PLAN =============
// @route   PUT /api/subscriptions/plans/:planId
// @desc    Update subscription plan (Creator only)
// @access  Private (Creator)
router.put('/plans/:planId', auth, isCreator, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.planId);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (plan.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, price, durationInDays, benefits, features, isPublic, isActive } = req.body;

    // Cannot change price for active subscriptions (would deprecate plan instead)
    if (price && parseFloat(price) !== parseFloat(plan.price)) {
      const activeSubscriptions = await UserSubscription.count({
        where: {
          planId: req.params.planId,
          status: 'active'
        }
      });

      if (activeSubscriptions > 0) {
        return res.status(400).json({ message: 'Cannot change price for active subscriptions. Deactivate and create new plan instead.' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (durationInDays) updateData.durationInDays = parseInt(durationInDays);
    const planFeatures = features || benefits;
    if (planFeatures) updateData.features = typeof planFeatures === 'string' ? JSON.parse(planFeatures) : planFeatures;
    if (isPublic !== undefined) updateData.isPublic = isPublic !== 'false';
    if (isActive !== undefined) updateData.isActive = isActive !== 'false';

    await plan.update(updateData);

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: plan
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= DELETE SUBSCRIPTION PLAN =============
// @route   DELETE /api/subscriptions/plans/:planId
// @desc    Deactivate subscription plan
// @access  Private (Creator)
router.delete('/plans/:planId', auth, isCreator, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.planId);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (plan.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await plan.update({ isActive: false, isPublic: false });

    res.json({
      success: true,
      message: 'Plan deactivated successfully'
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= SUBSCRIBE TO PLAN =============
// @route   POST /api/subscriptions/subscribe/:planId
// @desc    Subscribe to a plan
// @access  Private
router.post('/subscribe/:planId', auth, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.planId);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (!plan.isActive) {
      return res.status(400).json({ message: 'This plan is no longer available' });
    }

    // Check if already subscribed
    const existingSubscription = await UserSubscription.findOne({
      where: {
        userId: req.user.id,
        planId: req.params.planId,
        status: 'active'
      }
    });

    if (existingSubscription) {
      return res.status(409).json({ message: 'Already subscribed to this plan' });
    }

    // Get wallet
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });

    if (!wallet) {
      return res.status(400).json({ message: 'No wallet found. Please set up wallet first.' });
    }

    if (wallet.balance < plan.price) {
      return res.status(400).json({ message: 'Insufficient balance. Please top up your wallet.' });
    }

    // Deduct from wallet
    await wallet.decrement('balance', { by: plan.price });

    // Create transaction
    const creatorEarnings = plan.price * CREATOR_PERCENTAGE;
    const platformEarnings = plan.price * PLATFORM_FEE_PERCENTAGE;

    const transaction = await Transaction.create({
      userId: req.user.id,
      walletId: wallet.id,
      amount: plan.price,
      type: 'subscription_payment',
      status: 'completed',
      description: `Subscription to ${plan.name}`,
      reference: `SUB-${Date.now()}-${req.user.id.slice(0, 8)}`,
      paymentMethodType: 'wallet_transfer',
      platformFee: platformEarnings,
      metadata: {
        planId: req.params.planId,
        creatorId: plan.creatorId,
        creatorEarnings,
        platformEarnings
      }
    });

    // Create user subscription
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationInDays);

    const subscription = await UserSubscription.create({
      userId: req.user.id,
      planId: req.params.planId,
      startDate,
      endDate,
      nextBillingDate: endDate,
      status: 'active',
      autoRenewal: true,
      transactionId: transaction.id
    });

    // Update plan subscriber count
    await SubscriptionPlan.increment('activeSubscribers', {
      where: { id: req.params.planId }
    });

    // Add earnings to creator's wallet
    const creatorWallet = await Wallet.findOne({ where: { userId: plan.creatorId } });
    if (creatorWallet) {
      await creatorWallet.increment('balance', { by: creatorEarnings });
    }

    // Create notification for creator
    await Notification.create({
      userId: plan.creatorId,
      type: 'new_subscriber',
      relatedUserId: req.user.id,
      message: `${req.user.username} subscribed to your ${plan.name} plan`
    });

    res.status(201).json({
      success: true,
      message: 'Subscribed successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= CANCEL SUBSCRIPTION =============
// @route   POST /api/subscriptions/cancel/:subscriptionId
// @desc    Cancel subscription
// @access  Private
router.post('/cancel/:subscriptionId', auth, async (req, res) => {
  try {
    const subscription = await UserSubscription.findByPk(req.params.subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'Subscription is not active' });
    }

    const { reason } = req.body;

    await subscription.update({
      status: 'cancelled',
      cancellationReason: reason || null,
      cancelledAt: new Date(),
      autoRenewal: false
    });

    // Decrement plan subscriber count
    await SubscriptionPlan.decrement('activeSubscribers', {
      where: { id: subscription.planId }
    });

    // Get plan creator and send notification
    const plan = await SubscriptionPlan.findByPk(subscription.planId);
    if (plan) {
      await Notification.create({
        userId: plan.creatorId,
        type: 'subscription_expired',
        relatedUserId: req.user.id,
        message: `${req.user.username} cancelled their subscription`
      });
    }

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/pause/:subscriptionId', auth, async (req, res) => {
  try {
    const subscription = await UserSubscription.findByPk(req.params.subscriptionId);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    if (subscription.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'Subscription is not active' });
    }
    await subscription.update({ status: 'paused', autoRenewal: false });
    res.json({ success: true, message: 'Subscription paused' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= GET MY SUBSCRIPTIONS =============
// @route   GET /api/subscriptions/my
// @desc    Get user's active subscriptions
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const subscriptions = await UserSubscription.findAll({
      where: {
        userId: req.user.id,
        status: 'active'
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'profileImage', 'isVerified'] }]
        }
      ],
      order: [['nextBillingDate', 'ASC']]
    });

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Get my subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subscriptions/pause/:subscriptionId
router.post('/pause/:subscriptionId', auth, async (req, res) => {
  try {
    const subscription = await UserSubscription.findByPk(req.params.subscriptionId);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    if (subscription.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'Subscription is not active' });
    }
    await subscription.update({ status: 'paused', autoRenewal: false });
    res.json({ success: true, message: 'Subscription paused' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= GET PLAN SUBSCRIBERS =============
// @route   GET /api/subscriptions/subscribers/:planId
// @desc    Get subscribers for a plan (Creator only)
// @access  Private (Creator)
router.get('/subscribers/:planId', auth, isCreator, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    const allPlans = req.params.planId === 'all' || req.params.planId === 'null';
    const creatorPlans = await SubscriptionPlan.findAll({
      where: {
        creatorId: req.user.id,
        ...(allPlans ? {} : { id: req.params.planId }),
      },
      attributes: ['id', 'name', 'price'],
    });
    if (!creatorPlans.length) return res.status(404).json({ message: 'Plan not found' });
    const planIds = creatorPlans.map((plan) => plan.id);

    const { count, rows: subscribers } = await UserSubscription.findAndCountAll({
      where: {
        planId: { [Op.in]: planIds },
        status: 'active'
      },
      include: [
        { model: User, as: 'subscriber', attributes: ['id', 'username', 'profileImage', 'isVerified', 'settings'] },
        { model: SubscriptionPlan, as: 'plan', attributes: ['id', 'name', 'price'] },
      ],
      order: [['startDate', 'DESC']],
      offset,
      limit: limitNum,
      distinct: true
    });

    const masked = subscribers.map((sub) => {
      const json = sub.toJSON();
      const subscriber = json.subscriber;
      const privacy = subscriber?.settings?.privacy || {};
      const tenureMonths = Math.max(1, Math.floor((Date.now() - new Date(json.startDate).getTime()) / (30 * 24 * 60 * 60 * 1000)));
      const lifetimeSpend = tenureMonths * Number(json.plan?.price || 0);
      const loyaltyBadge = tenureMonths >= 12 || lifetimeSpend >= 5000
        ? 'gold'
        : tenureMonths >= 3 || lifetimeSpend >= 1000
          ? 'silver'
          : 'bronze';
      json.loyalty = { badge: loyaltyBadge, tenureMonths, lifetimeSpend };
      if (privacy.incognitoMode || privacy.hideFromSubscriberSearch) {
        json.subscriber = {
          ...subscriber,
          username: privacy.disguisedDisplayName || 'Fan',
          profileImage: null,
          isIncognito: true,
        };
      }
      return json;
    });

    res.json({
      success: true,
      data: masked,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= GET CREATOR EARNINGS =============
// @route   GET /api/subscriptions/earnings
// @desc    Get creator earnings (Creator only)
// @access  Private (Creator)
router.get('/earnings', auth, isCreator, async (req, res) => {
  try {
    const { timeRange = '30', planId } = req.query;
    const days = parseInt(timeRange) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let whereClause = {
      creatorId: req.user.id,
      createdAt: { [Op.gte]: startDate }
    };

    if (planId) {
      whereClause.id = planId;
    }

    // Get subscriptions created in timeframe
    const subscriptions = await UserSubscription.findAll({
      where: {
        planId: { [Op.in]: (await SubscriptionPlan.findAll({ where: { creatorId: req.user.id } })).map(p => p.id) },
        createdAt: { [Op.gte]: startDate }
      }
    });

    // Calculate earnings from subscriptions
    let totalEarnings = 0;
    let subscriptionEarnings = 0;

    for (const sub of subscriptions) {
      const plan = await SubscriptionPlan.findByPk(sub.planId);
      const creatorEarnings = plan.price * CREATOR_PERCENTAGE;
      subscriptionEarnings += creatorEarnings;
      totalEarnings += creatorEarnings;
    }

    // Get plan stats
    const plans = await SubscriptionPlan.findAll({
      where: { creatorId: req.user.id }
    });

    const planStats = await Promise.all(plans.map(async (plan) => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      activeSubscribers: plan.activeSubscribers,
      monthlyRevenue: plan.price * plan.activeSubscribers * CREATOR_PERCENTAGE
    })));

    res.json({
      success: true,
      data: {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        subscriptionEarnings: parseFloat(subscriptionEarnings.toFixed(2)),
        platformFee: parseFloat(((totalEarnings / CREATOR_PERCENTAGE) * PLATFORM_FEE_PERCENTAGE).toFixed(2)),
        totalSubscribers: subscriptions.length,
        planStats,
        timeRange: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= GET POPULAR PLANS =============
// @route   GET /api/subscriptions/popular
// @desc    Get popular subscription plans
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const plans = await SubscriptionPlan.findAll({
      where: {
        isActive: true,
        isPublic: true
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'profileImage', 'isVerified']
      }],
      order: [['activeSubscribers', 'DESC']],
      limit: parseInt(limit) || 10
    });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get popular plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
