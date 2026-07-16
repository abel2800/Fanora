const express = require('express');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const {
  Content, User, Comment, ContentPurchase, UserSubscription,
  SubscriptionPlan, Notification, Transaction, Wallet, Story
} = require('../models');
const { auth, isCreator, isEmailVerified, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { uploadBuffer } = require('../utils/cloudinary');

const router = express.Router();

async function serializeContentWithAccess(rows, userId) {
  const items = rows.map((row) => row.toJSON());
  const contentIds = items.map((item) => item.id);
  const creatorIds = new Set();
  const activePlanIds = new Set();
  const purchasedIds = new Set();

  if (userId && contentIds.length) {
    const [purchases, subscriptions] = await Promise.all([
      ContentPurchase.findAll({
        where: { userId, contentId: { [Op.in]: contentIds }, status: 'active' },
        attributes: ['contentId'],
      }),
      UserSubscription.findAll({
        where: { userId, status: 'active', endDate: { [Op.gt]: new Date() } },
        include: [{
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['creatorId'],
          required: true,
        }],
      }),
    ]);
    purchases.forEach((purchase) => purchasedIds.add(purchase.contentId));
    subscriptions.forEach((subscription) => {
      activePlanIds.add(subscription.planId);
      creatorIds.add(subscription.plan.creatorId);
    });
  }

  return items.map((item) => {
    const hasAccess = item.accessType === 'free' ||
      item.creatorId === userId ||
      purchasedIds.has(item.id) ||
      (item.accessType === 'premium' && (
        item.requiredTierId
          ? activePlanIds.has(item.requiredTierId)
          : creatorIds.has(item.creatorId)
      ));
    item.hasAccess = hasAccess;
    item.isLocked = !hasAccess;
    if (!hasAccess) {
      item.mediaUrl = null;
      if (item.type === 'text' && item.description) {
        item.preview = `${item.description.slice(0, 80)}${item.description.length > 80 ? '…' : ''}`;
        item.description = null;
      }
    }
    return item;
  });
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// ============= CREATE CONTENT =============
// @route   POST /api/content
// @desc    Create new content (Creator only)
// @access  Private (Creator)
router.post('/', auth, isCreator, isEmailVerified, upload.single('file'), async (req, res) => {
  try {
    const {
      title, description, type, accessType, price, tags, category,
      allowComments, allowTips, scheduledPublishDate, status,
    } = req.body;

    // Validation
    if (!title || !type) {
      return res.status(400).json({ message: 'Title and type are required' });
    }

    if (accessType === 'pay_per_view' && (!price || parseFloat(price) <= 0)) {
      return res.status(400).json({ message: 'Price is required for pay-per-view content' });
    }

    let mediaUrl = null;
    let mediaSize = 0;
    let mediaDuration = null;
    let mediaFormat = null;

    // Handle file upload
    if (req.file) {
      const uploaded = await uploadBuffer(req.file, 'content');
      mediaUrl = uploaded.url;
      mediaSize = uploaded.bytes || req.file.size;
      mediaFormat = uploaded.format || path.extname(req.file.originalname).substring(1);
      mediaDuration = uploaded.duration || null;
    }

    const content = await Content.create({
      creatorId: req.user.id,
      title,
      description,
      type,
      mediaUrl,
      mediaSize,
      mediaFormat,
      accessType: accessType || 'free',
      price: price || 0,
      currency: 'ETB',
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      category: category || 'other',
      status: status === 'published' && !scheduledPublishDate ? 'published' : 'draft',
      scheduledPublishDate: scheduledPublishDate || null,
      allowComments: allowComments !== 'false',
      allowTips: allowTips !== 'false',
    });

    await content.reload({
      include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'profileImage', 'isVerified'] }]
    });

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============= CREATOR CONTENT CALENDAR =============
router.get('/calendar/mine', auth, isCreator, async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = req.query.to ? new Date(req.query.to) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
    const items = await Content.findAll({
      where: {
        creatorId: req.user.id,
        [Op.or]: [
          { scheduledPublishDate: { [Op.between]: [from, to] } },
          { publishedAt: { [Op.between]: [from, to] } },
        ],
      },
      attributes: ['id', 'title', 'type', 'status', 'accessType', 'scheduledPublishDate', 'publishedAt', 'thumbnailUrl'],
      order: [[sequelize.fn('COALESCE', sequelize.col('scheduled_publish_date'), sequelize.col('published_at')), 'ASC']],
    });
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Content calendar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/calendar/:id', auth, isCreator, async (req, res) => {
  try {
    const content = await Content.findOne({ where: { id: req.params.id, creatorId: req.user.id } });
    if (!content) return res.status(404).json({ message: 'Content not found' });
    const scheduledAt = new Date(req.body.scheduledPublishDate);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      return res.status(400).json({ message: 'Schedule must be a future date' });
    }
    await content.update({ scheduledPublishDate: scheduledAt, status: 'draft' });
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= GET FEED (Enhanced) =============
// @route   GET /api/content/feed
// @desc    Get content feed
// @access  Public (with optional auth for personalization)
router.get('/feed', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, type, followingOnly = false, mode = 'for-you' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = { status: 'published' };

    const validTypes = ['image', 'video', 'audio', 'text', 'live_stream'];
    const validCategories = [
      'fitness', 'lifestyle', 'fashion', 'beauty', 'cooking', 'travel',
      'music', 'dance', 'comedy', 'education', 'art', 'photography',
      'gaming', 'sports', 'technology', 'business', 'other'
    ];

    if (category && validCategories.includes(category)) {
      whereClause.category = category;
    }
    if (type && validTypes.includes(type)) {
      whereClause.type = type;
    }

    // Filter following-only if requested
    let creatorIds = null;
    const followingMode = followingOnly === true || followingOnly === 'true' || mode === 'following';
    if (followingMode && req.user) {
      const user = await User.findByPk(req.user.id, {
        attributes: [],
        include: [{ association: 'following', attributes: ['id'], through: { attributes: [] } }]
      });
      creatorIds = user.following.map(f => f.id);
    }

    if (creatorIds && creatorIds.length > 0) {
      whereClause.creatorId = { [Op.in]: creatorIds };
    } else if (followingMode) {
      // User follows no one
      whereClause.creatorId = null;
    }

    const { count, rows: content } = await Content.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'profileImage', 'isVerified']
      }],
      order: mode === 'for-you'
        ? [
            [sequelize.literal('(views_count * 0.15 + likes_count * 2 + comments_count * 3)'), 'DESC'],
            ['publishedAt', 'DESC'],
          ]
        : [['publishedAt', 'DESC']],
      offset,
      limit: limitNum,
      distinct: true
    });

    const securedContent = await serializeContentWithAccess(content, req.user?.id);
    res.json({
      success: true,
      data: securedContent,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= GET TRENDING CONTENT =============
// @route   GET /api/content/trending
// @desc    Get trending content
// @access  Public
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const { limit = 10, timeRange = '7' } = req.query;
    const days = parseInt(timeRange) || 7;

    let whereClause = {
      status: 'published',
      publishedAt: { [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    };

    const trendingContent = await Content.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'profileImage', 'isVerified']
      }],
      order: [
        ['viewsCount', 'DESC'],
        ['likesCount', 'DESC']
      ],
      limit: parseInt(limit) || 10
    });

    const securedContent = await serializeContentWithAccess(trendingContent, req.user?.id);
    res.json({
      success: true,
      data: securedContent
    });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ============= GET CONTENT DETAIL =============
// @route   GET /api/content/:id
// @desc    Get content detail
// @access  Public (with access control)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'profileImage', 'isVerified'] },
        { model: Comment, as: 'comments', limit: 5, order: [['createdAt', 'DESC']],
          include: [{ model: User, as: 'author', attributes: ['id', 'username', 'profileImage'] }]
        }
      ]
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check access permissions
    let hasAccess = false;
    let requiresPayment = false;

    if (content.accessType === 'free') {
      hasAccess = true;
    } else if (req.user) {
      // Check if creator
      if (content.creatorId === req.user.id) {
        hasAccess = true;
      }
      // Check if subscribed (for premium content)
      else if (content.accessType === 'premium') {
        const subscription = await UserSubscription.findOne({
          where: {
            userId: req.user.id,
            ...(content.requiredTierId ? { planId: content.requiredTierId } : {}),
            status: 'active',
            endDate: { [Op.gt]: new Date() }
          },
          ...(!content.requiredTierId ? {
            include: [{
              model: SubscriptionPlan,
              as: 'plan',
              where: { creatorId: content.creatorId },
              required: true,
            }],
          } : {}),
        });
        if (subscription) hasAccess = true;
        else requiresPayment = true;
      }
      // Check if purchased (for pay-per-view)
      else if (content.accessType === 'pay_per_view') {
        const purchase = await ContentPurchase.findOne({
          where: {
            userId: req.user.id,
            contentId: req.params.id,
            status: 'active'
          }
        });
        if (purchase) hasAccess = true;
        else requiresPayment = true;
      }
    } else {
      requiresPayment = content.accessType !== 'free';
    }

    // Increment view count
    if (hasAccess || !requiresPayment) {
      await Content.increment('viewsCount', { where: { id: req.params.id } });
    }

    const secured = content.toJSON();
    if (!hasAccess) {
      secured.mediaUrl = null;
      if (secured.type === 'text' && secured.description) {
        secured.preview = `${secured.description.slice(0, 80)}${secured.description.length > 80 ? '…' : ''}`;
        secured.description = null;
      }
    }
    res.json({
      success: true,
      data: {
        ...secured,
        hasAccess,
        requiresPayment: requiresPayment,
        price: requiresPayment ? content.price : null
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= UPDATE CONTENT =============
// @route   PUT /api/content/:id
// @desc    Update content (Creator only)
// @access  Private (Creator)
router.put('/:id', auth, isCreator, async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (content.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, tags, category, status, price, accessType, allowComments, allowTips } = req.body;

    // Cannot update media for published content
    if (content.status === 'published' && content.mediaUrl) {
      return res.status(400).json({ message: 'Cannot update media for published content' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (tags) updateData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (category) updateData.category = category;
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      updateData.status = status;
    }
    if (price !== undefined) updateData.price = price;
    if (accessType) updateData.accessType = accessType;
    if (allowComments !== undefined) updateData.allowComments = allowComments;
    if (allowTips !== undefined) updateData.allowTips = allowTips;

    await content.update(updateData);

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: content
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= DELETE CONTENT =============
// @route   DELETE /api/content/:id
// @desc    Delete content (Creator only - soft delete)
// @access  Private (Creator)
router.delete('/:id', auth, isCreator, async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (content.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await content.update({ status: 'archived' });

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= GET CREATOR'S CONTENT =============
// @route   GET /api/content/creator/:creatorId
// @desc    Get creator's content list
// @access  Private for draft, Public for published
router.get('/creator/:creatorId', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category, status } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = { creatorId: req.params.creatorId };

    // Only show published content unless requesting user is the creator
    if (!req.user || req.user.id !== req.params.creatorId) {
      whereClause.status = 'published';
    } else if (status) {
      whereClause.status = status;
    }

    if (type) whereClause.type = type;
    if (category) whereClause.category = category;

    const { count, rows: content } = await Content.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'profileImage', 'isVerified'] }],
      order: [['publishedAt', 'DESC']],
      offset,
      limit: limitNum
    });

    const securedContent = await serializeContentWithAccess(content, req.user?.id);
    res.json({
      success: true,
      data: securedContent,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Get creator content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= LIKE CONTENT =============
// @route   POST /api/content/:id/like
// @desc    Like content
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if already liked
    const existingLike = await sequelize.query(
      'SELECT * FROM content_likes WHERE content_id = ? AND user_id = ?',
      { replacements: [req.params.id, req.user.id] }
    );

    if (existingLike[0].length > 0) {
      return res.status(409).json({ message: 'Already liked' });
    }

    // Add like
    await sequelize.query(
      'INSERT INTO content_likes (content_id, user_id) VALUES (?, ?)',
      { replacements: [req.params.id, req.user.id] }
    );

    // Increment like count
    await Content.increment('likesCount', { where: { id: req.params.id } });

    // Create notification for creator
    if (content.creatorId !== req.user.id) {
      await Notification.create({
        userId: content.creatorId,
        type: 'content_like',
        relatedUserId: req.user.id,
        relatedContentId: req.params.id,
        message: `${req.user.username} liked your content`
      });
    }

    res.json({
      success: true,
      message: 'Content liked successfully'
    });
  } catch (error) {
    console.error('Like content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= UNLIKE CONTENT =============
// @route   DELETE /api/content/:id/like
// @desc    Unlike content
// @access  Private
router.delete('/:id/like', auth, async (req, res) => {
  try {
    // Remove like
    await sequelize.query(
      'DELETE FROM content_likes WHERE content_id = ? AND user_id = ?',
      { replacements: [req.params.id, req.user.id] }
    );

    // Decrement like count
    await Content.decrement('likesCount', {
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Like removed successfully'
    });
  } catch (error) {
    console.error('Unlike content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= ADD COMMENT =============
// @route   POST /api/content/:id/comments
// @desc    Add comment to content
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text, parentCommentId } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const content = await Content.findByPk(req.params.id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (!content.allowComments) {
      return res.status(403).json({ message: 'Comments are disabled for this content' });
    }

    const comment = await Comment.create({
      contentId: req.params.id,
      userId: req.user.id,
      parentCommentId: parentCommentId || null,
      text: text.trim(),
      status: 'approved'
    });

    // Increment comment count
    await Content.increment('commentsCount', { where: { id: req.params.id } });

    // Reload with user info
    await comment.reload({
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'profileImage'] }]
    });

    // Create notification for creator
    if (content.creatorId !== req.user.id) {
      await Notification.create({
        userId: content.creatorId,
        type: 'content_comment',
        relatedUserId: req.user.id,
        relatedContentId: req.params.id,
        message: `${req.user.username} commented on your content`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= GET COMMENTS =============
// @route   GET /api/content/:id/comments
// @desc    Get comments for content
// @access  Public
router.get('/:id/comments', async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'newest' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let order = [['createdAt', 'DESC']];
    if (sortBy === 'popular') {
      order = [['likesCount', 'DESC'], ['createdAt', 'DESC']];
    }

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: {
        contentId: req.params.id,
        status: 'approved',
        parentCommentId: null // Only top-level comments
      },
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'profileImage'] },
        {
          model: Comment,
          as: 'replies',
          include: [{ model: User, as: 'author', attributes: ['id', 'username', 'profileImage'] }],
          where: { status: 'approved' },
          required: false
        }
      ],
      order,
      offset,
      limit: limitNum,
      distinct: true
    });

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= DELETE COMMENT =============
// @route   DELETE /api/content/:contentId/comments/:commentId
// @desc    Delete comment
// @access  Private (Owner or Content Creator)
router.delete('/:contentId/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const content = await Content.findByPk(req.params.contentId);

    // Check authorization (comment owner or content creator)
    if (comment.userId !== req.user.id && content.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.update({ status: 'deleted' });

    // Decrement comment count
    await Content.decrement('commentsCount', { where: { id: req.params.contentId } });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ============= PURCHASE PAY-PER-VIEW CONTENT =============
// @route   POST /api/content/:id/purchase
// @desc    Purchase pay-per-view content with wallet
// @access  Private
router.post('/:id/purchase', auth, isEmailVerified, async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }]
    });

    if (!content || content.status !== 'published') {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (content.accessType !== 'pay_per_view') {
      return res.status(400).json({ message: 'Content is not pay-per-view' });
    }

    if (content.creatorId === req.user.id) {
      return res.status(400).json({ message: 'You already own this content' });
    }

    const existing = await ContentPurchase.findOne({
      where: { contentId: content.id, userId: req.user.id, status: 'active' }
    });
    if (existing) {
      return res.status(409).json({ message: 'Content already purchased' });
    }

    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const price = parseFloat(content.price);
    if (parseFloat(wallet.balance) < price) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    const creatorWallet = await Wallet.findOne({ where: { userId: content.creatorId } });
    const creatorEarnings = price * 0.7;
    const platformFee = price * 0.3;

    await wallet.decrement('balance', { by: price });
    if (creatorWallet) {
      await creatorWallet.increment('balance', { by: creatorEarnings });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      walletId: wallet.id,
      amount: price,
      type: 'content_purchase',
      status: 'completed',
      description: `Purchase: ${content.title}`,
      reference: `PPV-${Date.now()}-${req.user.id.slice(0, 8)}`,
      paymentMethodType: 'wallet_transfer',
      platformFee,
      metadata: { contentId: content.id, creatorEarnings, platformFee },
    });

    const purchase = await ContentPurchase.create({
      contentId: content.id,
      userId: req.user.id,
      price,
      currency: 'ETB',
      type: 'paid_view',
      transactionId: transaction.id,
      status: 'active',
    });

    await Notification.create({
      userId: content.creatorId,
      type: 'content_published',
      relatedUserId: req.user.id,
      relatedContentId: content.id,
      message: `${req.user.username} purchased your content`,
    });

    res.status(201).json({
      success: true,
      message: 'Content purchased successfully',
      data: purchase,
    });
  } catch (error) {
    console.error('Purchase content error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============= MY CONTENT PURCHASES =============
router.get('/purchases/my', auth, async (req, res) => {
  try {
    const purchases = await ContentPurchase.findAll({
      where: { userId: req.user.id, status: 'active' },
      include: [{
        model: Content,
        as: 'content',
        include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'profileImage'] }]
      }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: purchases });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
