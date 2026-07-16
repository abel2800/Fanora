const express = require('express');
const { Op } = require('sequelize');
const {
  sequelize, User, Message, Conversation, Notification,
  SubscriptionPlan, UserSubscription, Wallet,
} = require('../models');
const { auth, isCreator } = require('../middleware/auth');

const router = express.Router();

const findOrCreateConversation = async (userOneId, userTwoId) => {
  const participants = [userOneId, userTwoId].sort();

  let conversation = await Conversation.findOne({
    where: {
      [Op.and]: [
        { participantIds: { [Op.contains]: [participants[0]] } },
        { participantIds: { [Op.contains]: [participants[1]] } },
      ],
    },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participantIds: participants,
      isActive: true,
    });
  }

  return conversation;
};

const getOtherParticipant = (conversation, userId) => {
  return conversation.participantIds.find((id) => id !== userId);
};

// @route   GET /api/messages/conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: {
        participantIds: { [Op.contains]: [req.user.id] },
        isActive: true,
      },
      order: [['lastMessageAt', 'DESC NULLS LAST']],
    });

    const enriched = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUserId = getOtherParticipant(conversation, req.user.id);
        const otherUser = await User.findByPk(otherUserId, {
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
        });

        const lastMessage = conversation.lastMessageId
          ? await Message.findByPk(conversation.lastMessageId)
          : await Message.findOne({
              where: { conversationId: conversation.id },
              order: [['createdAt', 'DESC']],
            });

        const unreadCount = await Message.count({
          where: {
            conversationId: conversation.id,
            recipientId: req.user.id,
            isRead: false,
          },
        });

        return {
          id: conversation.id,
          otherUser,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                senderId: lastMessage.senderId,
              }
            : null,
          unreadCount,
          updatedAt: conversation.lastMessageAt || conversation.updatedAt,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversations/:userId
router.get('/conversations/:userId', auth, async (req, res) => {
  try {
    const conversation = await findOrCreateConversation(req.user.id, req.params.userId);
    res.json({ success: true, data: { conversationId: conversation.id } });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/unread/count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.count({
      where: { recipientId: req.user.id, isRead: false },
    });
    res.json({ success: true, count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/search
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({ success: true, data: [] });
    }

    const messages = await Message.findAll({
      where: {
        [Op.and]: [
          { [Op.or]: [{ senderId: req.user.id }, { recipientId: req.user.id }] },
          {
            [Op.or]: [
              { isPaid: false },
              { isUnlocked: true },
              { senderId: req.user.id },
            ],
          },
        ],
        content: { [Op.iLike]: `%${q.trim()}%` },
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'profileImage'] },
        { model: User, as: 'recipient', attributes: ['id', 'username', 'profileImage'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/:userId
router.get('/:userId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const offset = (pageNum - 1) * limitNum;

    const conversation = await findOrCreateConversation(req.user.id, req.params.userId);

    const { count, rows } = await Message.findAndCountAll({
      where: { conversationId: conversation.id },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'profileImage'],
        },
      ],
      order: [['createdAt', 'ASC']],
      offset,
      limit: limitNum,
    });

    const messages = rows.map((row) => {
      const item = row.toJSON();
      const lockedForViewer = item.isPaid && !item.isUnlocked && item.recipientId === req.user.id;
      if (lockedForViewer) {
        item.preview = `${item.content.slice(0, 18)}…`;
        item.content = null;
        item.mediaUrl = null;
      }
      return item;
    });

    res.json({
      success: true,
      data: messages,
      conversationId: conversation.id,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/send/:userId
router.post('/send/:userId', auth, async (req, res) => {
  try {
    const { content, mediaUrl, price } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    if (Number(price) > 0 && !req.user.isCreator) {
      return res.status(403).json({ message: 'Only creators can send paid messages' });
    }

    const recipient = await User.findByPk(req.params.userId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    if (recipient.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    const conversation = await findOrCreateConversation(req.user.id, recipient.id);

    const message = await Message.create({
      senderId: req.user.id,
      recipientId: recipient.id,
      conversationId: conversation.id,
      content: content.trim(),
      mediaUrl: mediaUrl || null,
      price: Number(price) || 0,
      isPaid: Number(price) > 0,
      isUnlocked: Number(price) <= 0,
      isRead: false,
    });

    await conversation.update({
      lastMessageId: message.id,
      lastMessageAt: new Date(),
    });

    await Notification.create({
      userId: recipient.id,
      type: 'message_received',
      relatedUserId: req.user.id,
      title: 'New message',
      message: `${req.user.username} sent you a message`,
    }).catch(() => {});

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/:messageId/unlock
router.post('/:messageId/unlock', auth, async (req, res) => {
  try {
    const message = await Message.findOne({
      where: { id: req.params.messageId, recipientId: req.user.id, isPaid: true },
    });
    if (!message) return res.status(404).json({ message: 'Paid message not found' });
    if (message.isUnlocked) return res.json({ success: true, data: message });

    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    const creatorWallet = await Wallet.findOne({ where: { userId: message.senderId } });
    const price = Number(message.price);
    if (!wallet || Number(wallet.balance) < price) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    if (req.body.pin && !(await wallet.verifyPin(req.body.pin))) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    await sequelize.transaction(async (transaction) => {
      await wallet.decrement('balance', { by: price, transaction });
      if (creatorWallet) await creatorWallet.increment('balance', { by: price * 0.7, transaction });
      await message.update({ isUnlocked: true }, { transaction });
    });
    await Notification.create({
      userId: message.senderId,
      type: 'purchase',
      relatedUserId: req.user.id,
      title: 'Paid message unlocked',
      message: `${req.user.username} unlocked your paid message`,
      data: { messageId: message.id, deepLink: `/messages/${req.user.id}` },
    });
    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Unlock message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/read/:conversationId
router.post('/read/:conversationId', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findByPk(req.params.conversationId);
    if (!conversation || !conversation.participantIds.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          conversationId: conversation.id,
          recipientId: req.user.id,
          isRead: false,
        },
      }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/conversations/:userId
router.delete('/conversations/:userId', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      where: {
        participantIds: {
          [Op.contains]: [req.user.id, req.params.userId],
        },
      },
    });

    // Fallback for string/array storage differences
    let target = conversation;
    if (!target) {
      const all = await Conversation.findAll();
      target = all.find((c) => {
        const ids = c.participantIds || [];
        return ids.includes(req.user.id) && ids.includes(req.params.userId);
      });
    }

    if (!target) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    await Message.destroy({ where: { conversationId: target.id } });
    await target.destroy();

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/blast
router.post('/blast', auth, isCreator, async (req, res) => {
  try {
    const { content, mediaUrl, price, segment = 'all' } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const plans = await SubscriptionPlan.findAll({
      where: { creatorId: req.user.id, isActive: true },
      attributes: ['id'],
    });
    const planIds = plans.map((p) => p.id);
    if (!planIds.length) {
      return res.status(400).json({ message: 'No active subscription plans' });
    }

    let subWhere = { planId: { [Op.in]: planIds }, status: 'active' };
    if (segment === 'new') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      subWhere.startDate = { [Op.gte]: weekAgo };
    } else if (segment === 'loyal') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      subWhere.startDate = { [Op.lte]: threeMonthsAgo };
    }

    const subs = await UserSubscription.findAll({
      where: subWhere,
      attributes: ['userId'],
    });
    const recipientIds = [...new Set(subs.map((s) => s.userId))].filter((id) => id !== req.user.id);

    let sent = 0;
    const priceNum = parseFloat(price) || 0;
    for (const recipientId of recipientIds) {
      const conversation = await findOrCreateConversation(req.user.id, recipientId);
      await Message.create({
        senderId: req.user.id,
        recipientId,
        conversationId: conversation.id,
        content: content.trim(),
        mediaUrl: mediaUrl || null,
        price: priceNum,
        isPaid: priceNum > 0,
        isUnlocked: priceNum <= 0,
        isBlast: true,
        isRead: false,
      });
      await conversation.update({ lastMessageAt: new Date() });
      await Notification.create({
        userId: recipientId,
        type: 'message_received',
        relatedUserId: req.user.id,
        title: priceNum > 0 ? 'New paid message' : 'Message from creator',
        message: `${req.user.username} sent you a message`,
      }).catch(() => {});
      sent += 1;
    }

    res.json({ success: true, message: `Sent to ${sent} subscribers`, data: { sent, segment } });
  } catch (error) {
    console.error('Mass message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
