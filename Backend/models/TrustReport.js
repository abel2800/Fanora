const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TrustReport = sequelize.define('TrustReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reporterId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'reporter_id',
    references: { model: 'users', key: 'id' },
  },
  targetUserId: {
    type: DataTypes.UUID,
    field: 'target_user_id',
    references: { model: 'users', key: 'id' },
  },
  targetContentId: {
    type: DataTypes.UUID,
    field: 'target_content_id',
    references: { model: 'content', key: 'id' },
  },
  type: {
    type: DataTypes.ENUM('content', 'user', 'refund', 'dispute'),
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'reviewing', 'resolved', 'rejected'),
    defaultValue: 'open',
  },
  adminNotes: {
    type: DataTypes.TEXT,
    field: 'admin_notes',
  },
  resolvedAt: {
    type: DataTypes.DATE,
    field: 'resolved_at',
  },
}, {
  tableName: 'trust_reports',
  underscored: true,
});

module.exports = TrustReport;
