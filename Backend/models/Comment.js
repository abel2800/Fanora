const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  contentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'content_id',
    references: {
      model: 'content',
      key: 'id',
    },
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
  parentCommentId: {
    type: DataTypes.UUID,
    field: 'parent_comment_id',
    references: {
      model: 'comments',
      key: 'id',
    },
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 1000],
    },
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'likes_count',
  },
  status: {
    type: DataTypes.ENUM('approved', 'flagged', 'deleted'),
    defaultValue: 'approved',
  },
}, {
  tableName: 'comments',
  indexes: [
    { fields: ['content_id', 'created_at'] },
    { fields: ['user_id', 'created_at'] },
    { fields: ['parent_comment_id'] },
    { fields: ['status'] },
  ],
});

module.exports = Comment;
