const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  // Telebirr account details
  telebirrPhoneNumber: {
    type: DataTypes.STRING(15),
    field: 'telebirr_phone_number',
  },
  telebirrIsVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'telebirr_is_verified',
  },
  telebirrVerificationDate: {
    type: DataTypes.DATE,
    field: 'telebirr_verification_date',
  },
  // CBE account details
  cbeAccountNumber: {
    type: DataTypes.STRING(20),
    field: 'cbe_account_number',
  },
  cbePhoneNumber: {
    type: DataTypes.STRING(15),
    field: 'cbe_phone_number',
  },
  cbeIsVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'cbe_is_verified',
  },
  cbeVerificationDate: {
    type: DataTypes.DATE,
    field: 'cbe_verification_date',
  },
  // Security settings
  pinCode: {
    type: DataTypes.STRING,
    field: 'pin_code',
  },
  hasPinCode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'has_pin_code',
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'two_factor_enabled',
  },
  lastPinChange: {
    type: DataTypes.DATE,
    field: 'last_pin_change',
  },
  // Spending limits
  dailySpendLimit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 5000,
    field: 'daily_spend_limit',
  },
  monthlySpendLimit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 50000,
    field: 'monthly_spend_limit',
  },
  dailySpent: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'daily_spent',
  },
  monthlySpent: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'monthly_spent',
  },
  lastResetDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'last_reset_date',
  },
}, {
  tableName: 'wallets',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['telebirr_phone_number'] },
    { fields: ['cbe_phone_number'] },
  ],
});

// Method to add funds to wallet
Wallet.prototype.addFunds = async function(amount, description = 'Funds added') {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  this.balance = parseFloat(this.balance) + parseFloat(amount);
  return await this.save();
};

// Method to deduct funds from wallet
Wallet.prototype.deductFunds = async function(amount, description = 'Funds deducted') {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  const currentBalance = parseFloat(this.balance);
  if (currentBalance < amount) {
    throw new Error('Insufficient balance');
  }
  
  // Check daily spending limit
  const today = new Date();
  const lastReset = new Date(this.lastResetDate);
  
  // Reset daily spending if it's a new day
  if (today.toDateString() !== lastReset.toDateString()) {
    this.dailySpent = 0;
    this.lastResetDate = today;
  }
  
  // Reset monthly spending if it's a new month
  if (today.getMonth() !== lastReset.getMonth() || today.getFullYear() !== lastReset.getFullYear()) {
    this.monthlySpent = 0;
  }
  
  // Check spending limits
  const dailySpent = parseFloat(this.dailySpent);
  const monthlySpent = parseFloat(this.monthlySpent);
  
  if (dailySpent + amount > this.dailySpendLimit) {
    throw new Error('Daily spending limit exceeded');
  }
  
  if (monthlySpent + amount > this.monthlySpendLimit) {
    throw new Error('Monthly spending limit exceeded');
  }
  
  this.balance = currentBalance - parseFloat(amount);
  this.dailySpent = dailySpent + parseFloat(amount);
  this.monthlySpent = monthlySpent + parseFloat(amount);
  
  return await this.save();
};

// Method to check if wallet has sufficient balance
Wallet.prototype.hasSufficientBalance = function(amount) {
  return parseFloat(this.balance) >= parseFloat(amount);
};

// Method to get formatted balance
Wallet.prototype.getFormattedBalance = function() {
  return `${parseFloat(this.balance).toLocaleString()} ${this.currency}`;
};

// Method to verify PIN
Wallet.prototype.verifyPin = async function(pin) {
  if (!this.hasPinCode) {
    throw new Error('No PIN code set');
  }
  
  return await bcrypt.compare(pin, this.pinCode);
};

// Method to set PIN
Wallet.prototype.setPin = async function(pin) {
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be 4 digits');
  }
  
  const salt = await bcrypt.genSalt(10);
  this.pinCode = await bcrypt.hash(pin, salt);
  this.hasPinCode = true;
  this.lastPinChange = new Date();
  
  return await this.save();
};

module.exports = Wallet;