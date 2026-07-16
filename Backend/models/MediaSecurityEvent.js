const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MediaSecurityEvent = sequelize.define('MediaSecurityEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: { model: 'users', key: 'id' },
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'creator_id',
    references: { model: 'users', key: 'id' },
  },
  contentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'content_id',
    references: { model: 'content', key: 'id' },
  },
  eventType: {
    type: DataTypes.ENUM('screenshot', 'screen_recording'),
    allowNull: false,
    field: 'event_type',
  },
  platform: DataTypes.STRING(20),
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'media_security_events',
  underscored: true,
  indexes: [{ fields: ['creator_id', 'created_at'] }],
});

module.exports = MediaSecurityEvent;
