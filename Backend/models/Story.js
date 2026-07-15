const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Story = sequelize.define('Story', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'creator_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  mediaUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'media_url',
  },
  mediaType: {
    type: DataTypes.ENUM('image', 'video'),
    defaultValue: 'image',
    field: 'media_type',
  },
  duration: {
    type: DataTypes.INTEGER, // in seconds
    defaultValue: 5,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'views_count',
  },
  viewers: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('published', 'archived', 'expired'),
    defaultValue: 'published',
  },
}, {
  tableName: 'stories',
  indexes: [
    { fields: ['creator_id', 'created_at'] },
    { fields: ['expires_at'] },
    { fields: ['status', 'expires_at'] },
  ],
});

module.exports = Story;
