const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContentBundle = sequelize.define('ContentBundle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'creator_id',
    references: { model: 'users', key: 'id' },
  },
  title: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB',
  },
  contentIds: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'content_ids',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  purchaseCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'purchase_count',
  },
}, {
  tableName: 'content_bundles',
  underscored: true,
});

module.exports = ContentBundle;
