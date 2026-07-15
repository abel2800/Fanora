const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
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
  walletId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'wallet_id',
    references: {
      model: 'wallets',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('deposit', 'withdrawal', 'subscription_payment', 'tip', 'refund', 'commission'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB',
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled', 'processing'),
    defaultValue: 'pending',
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  // Payment method details
  paymentMethodType: {
    type: DataTypes.ENUM('telebirr', 'cbe_mobile', 'wallet_transfer'),
    allowNull: false,
    field: 'payment_method_type',
  },
  paymentMethodDetails: {
    type: DataTypes.JSONB,
    field: 'payment_method_details',
    defaultValue: {},
  },
  // Related entities
  relatedModel: {
    type: DataTypes.STRING,
    field: 'related_model',
  },
  relatedId: {
    type: DataTypes.UUID,
    field: 'related_id',
  },
  // Fee information
  platformFee: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'platform_fee',
  },
  paymentGatewayFee: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'payment_gateway_fee',
  },
  totalFees: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'total_fees',
  },
  // Transaction metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  // Timestamps for different states
  initiatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'initiated_at',
  },
  processingAt: {
    type: DataTypes.DATE,
    field: 'processing_at',
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at',
  },
  failedAt: {
    type: DataTypes.DATE,
    field: 'failed_at',
  },
  cancelledAt: {
    type: DataTypes.DATE,
    field: 'cancelled_at',
  },
  // Error information
  errorCode: {
    type: DataTypes.STRING,
    field: 'error_code',
  },
  errorMessage: {
    type: DataTypes.TEXT,
    field: 'error_message',
  },
  errorDetails: {
    type: DataTypes.JSONB,
    field: 'error_details',
  },
  // Reconciliation
  isReconciled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_reconciled',
  },
  reconciledAt: {
    type: DataTypes.DATE,
    field: 'reconciled_at',
  },
  reconciledBy: {
    type: DataTypes.UUID,
    field: 'reconciled_by',
  },
}, {
  tableName: 'transactions',
  indexes: [
    { fields: ['user_id', 'created_at'] },
    { fields: ['wallet_id', 'created_at'] },
    { fields: ['reference'] },
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['payment_method_type'] },
  ],
});

// Pre-save hook to generate reference and calculate fees
Transaction.beforeCreate((transaction) => {
  // Generate reference if not provided
  if (!transaction.reference) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    transaction.reference = `TXN-${timestamp}-${random}`;
  }
  
  // Set initiated_at if not set
  if (!transaction.initiatedAt) {
    transaction.initiatedAt = new Date();
  }
  
  // Calculate total fees
  const platformFee = parseFloat(transaction.platformFee) || 0;
  const gatewayFee = parseFloat(transaction.paymentGatewayFee) || 0;
  transaction.totalFees = platformFee + gatewayFee;
});

// Method to mark transaction as processing
Transaction.prototype.markAsProcessing = async function() {
  this.status = 'processing';
  this.processingAt = new Date();
  return await this.save();
};

// Method to mark transaction as completed
Transaction.prototype.markAsCompleted = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return await this.save();
};

// Method to mark transaction as failed
Transaction.prototype.markAsFailed = async function(errorCode, errorMessage, errorDetails = null) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.errorCode = errorCode;
  this.errorMessage = errorMessage;
  this.errorDetails = errorDetails;
  return await this.save();
};

// Method to mark transaction as cancelled
Transaction.prototype.markAsCancelled = async function() {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  return await this.save();
};

// Method to get formatted amount
Transaction.prototype.getFormattedAmount = function() {
  return `${parseFloat(this.amount).toLocaleString()} ${this.currency}`;
};

// Static method to generate unique reference
Transaction.generateReference = function() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

module.exports = Transaction;