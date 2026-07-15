const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContentPurchase = sequelize.define('ContentPurchase', {
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
  contentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'content_id',
    references: {
      model: 'content',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('paid_view', 'tier_subscription'),
    defaultValue: 'paid_view',
  },
  subscriptionPlanId: {
    type: DataTypes.UUID,
    field: 'subscription_plan_id',
    references: {
      model: 'subscription_plans',
      key: 'id',
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB',
  },
  transactionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'transaction_id',
    references: {
      model: 'transactions',
      key: 'id',
    },
  },
  expiresAt: {
    type: DataTypes.DATE,
    field: 'expires_at',
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled'),
    defaultValue: 'active',
  },
}, {
  tableName: 'content_purchases',
  indexes: [
    { fields: ['user_id', 'content_id'] },
    { fields: ['user_id', 'status'] },
    { fields: ['content_id'] },
    { fields: ['expires_at', 'status'] },
  ],
});

module.exports = ContentPurchase;
