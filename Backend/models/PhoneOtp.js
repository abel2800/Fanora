const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PhoneOtp = sequelize.define('PhoneOtp', {
  phoneNumber: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    field: 'phone_number',
  },
  codeHash: {
    type: DataTypes.STRING(64),
    allowNull: false,
    field: 'code_hash',
  },
  purpose: {
    type: DataTypes.ENUM('register', 'login'),
    defaultValue: 'register',
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'sent_at',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
  verifiedAt: {
    type: DataTypes.DATE,
    field: 'verified_at',
  },
}, {
  tableName: 'phone_otps',
  timestamps: true,
  underscored: true,
});

module.exports = PhoneOtp;
