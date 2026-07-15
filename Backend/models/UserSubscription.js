const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserSubscription = sequelize.define('UserSubscription', {
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
  planId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'plan_id',
    references: {
      model: 'subscription_plans',
      key: 'id',
    },
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'start_date',
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_date',
  },
  nextBillingDate: {
    type: DataTypes.DATE,
    field: 'next_billing_date',
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'expired', 'paused'),
    defaultValue: 'active',
  },
  autoRenewal: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'auto_renewal',
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    field: 'cancellation_reason',
  },
  cancelledAt: {
    type: DataTypes.DATE,
    field: 'cancelled_at',
  },
  transactionId: {
    type: DataTypes.UUID,
    field: 'transaction_id',
    references: {
      model: 'transactions',
      key: 'id',
    },
  },
}, {
  tableName: 'user_subscriptions',
  indexes: [
    { fields: ['user_id', 'status'] },
    { fields: ['plan_id', 'status'] },
    { fields: ['end_date', 'status'] },
    { fields: ['next_billing_date'] },
  ],
});

module.exports = UserSubscription;
