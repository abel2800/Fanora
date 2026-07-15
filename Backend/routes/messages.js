const express = require('express');
const { Op } = require('sequelize');
const { sequelize, User, Message, Conversation, Notification } = require('../models');
const { auth } = require('../middleware/auth');

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
        [Op.or]: [{ senderId: req.user.id }, { recipientId: req.user.id }],
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

    res.json({
      success: true,
      data: rows,
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
    const { content, mediaUrl } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
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

module.exports = router;
