const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM(
      'new_follower',
      'new_subscriber',
      'content_like',
      'content_comment',
      'tip_received',
      'message_received',
      'subscription_expired',
      'content_published'
    ),
    allowNull: false,
  },
  relatedUserId: {
    type: DataTypes.UUID,
    field: 'related_user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  relatedContentId: {
    type: DataTypes.UUID,
    field: 'related_content_id',
    references: {
      model: 'content',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING(255),
  },
  message: {
    type: DataTypes.TEXT,
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {},
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
}, {
  tableName: 'notifications',
  indexes: [
    { fields: ['user_id', 'is_read', 'created_at'] },
    { fields: ['user_id', 'created_at'] },
    { fields: ['type'] },
  ],
});

module.exports = Notification;
