const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GiftVoucher = sequelize.define('GiftVoucher', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
  },
  purchaserId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'purchaser_id',
    references: { model: 'users', key: 'id' },
  },
  planId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'plan_id',
    references: { model: 'subscription_plans', key: 'id' },
  },
  recipientPhone: {
    type: DataTypes.STRING(20),
    field: 'recipient_phone',
  },
  recipientId: {
    type: DataTypes.UUID,
    field: 'recipient_id',
    references: { model: 'users', key: 'id' },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'redeemed', 'expired', 'cancelled'),
    defaultValue: 'active',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
  redeemedAt: {
    type: DataTypes.DATE,
    field: 'redeemed_at',
  },
}, {
  tableName: 'gift_vouchers',
  underscored: true,
});

module.exports = GiftVoucher;
