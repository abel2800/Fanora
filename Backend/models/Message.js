const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'sender_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  recipientId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'recipient_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'conversation_id',
    references: {
      model: 'conversations',
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  mediaUrl: {
    type: DataTypes.TEXT,
    field: 'media_url',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read',
  },
  readAt: {
    type: DataTypes.DATE,
    field: 'read_at',
  },
  deletedBySender: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'deleted_by_sender',
  },
  deletedByRecipient: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'deleted_by_recipient',
  },
}, {
  tableName: 'messages',
  indexes: [
    { fields: ['conversation_id', 'created_at'] },
    { fields: ['sender_id'] },
    { fields: ['recipient_id'] },
    { fields: ['is_read', 'recipient_id'] },
  ],
});

module.exports = Message;
