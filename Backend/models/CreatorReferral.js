const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CreatorReferral = sequelize.define('CreatorReferral', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  referrerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'referrer_id',
    references: { model: 'users', key: 'id' },
  },
  referredCreatorId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'referred_creator_id',
    references: { model: 'users', key: 'id' },
  },
  referralCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'referral_code',
  },
  bonusEarned: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'bonus_earned',
  },
  status: {
    type: DataTypes.ENUM('pending', 'qualified', 'paid'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'creator_referrals',
  underscored: true,
});

module.exports = CreatorReferral;
