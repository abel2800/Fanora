const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'creator_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB',
  },
  duration: {
    type: DataTypes.ENUM('weekly', 'monthly', 'quarterly', 'yearly'),
    defaultValue: 'monthly',
  },
  durationInDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'duration_in_days',
  },
  // Plan features
  features: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  // Access permissions
  accessToAllContent: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'access_to_all_content',
  },
  accessToLiveStreams: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'access_to_live_streams',
  },
  accessToExclusiveContent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'access_to_exclusive_content',
  },
  directMessaging: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'direct_messaging',
  },
  customRequests: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'custom_requests',
  },
  prioritySupport: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'priority_support',
  },
  // Plan status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_public',
  },
  // Subscriber limits
  maxSubscribers: {
    type: DataTypes.INTEGER,
    field: 'max_subscribers',
  },
  currentSubscribers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'current_subscribers',
  },
  // Discounts
  discounts: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  // Trial period
  trialEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'trial_enabled',
  },
  trialDurationInDays: {
    type: DataTypes.INTEGER,
    defaultValue: 7,
    field: 'trial_duration_in_days',
  },
  // Statistics
  totalSubscribers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_subscribers',
  },
  activeSubscribers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'active_subscribers',
  },
  totalRevenue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'total_revenue',
  },
  monthlyRevenue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'monthly_revenue',
  },
  churnRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'churn_rate',
  },
  averageSubscriptionLength: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'average_subscription_length',
  },
  // Content access rules
  allowedCategories: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    field: 'allowed_categories',
    defaultValue: [],
  },
  allowedTags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    field: 'allowed_tags',
    defaultValue: [],
  },
  excludedContentIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    field: 'excluded_content_ids',
    defaultValue: [],
  },
  // Billing settings
  autoRenewal: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'auto_renewal',
  },
  gracePeriodDays: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    field: 'grace_period_days',
  },
  reminderDays: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    field: 'reminder_days',
    defaultValue: [7, 3, 1],
  },
}, {
  tableName: 'subscription_plans',
  indexes: [
    { fields: ['creator_id', 'is_active'] },
    { fields: ['price'] },
    { fields: ['duration'] },
    { fields: ['is_public', 'is_active'] },
  ],
});

// Set duration in days before creating
SubscriptionPlan.beforeCreate((plan) => {
  const durationMap = {
    'weekly': 7,
    'monthly': 30,
    'quarterly': 90,
    'yearly': 365
  };
  
  plan.durationInDays = durationMap[plan.duration] || 30;
});

// Update duration in days when duration changes
SubscriptionPlan.beforeUpdate((plan) => {
  if (plan.changed('duration')) {
    const durationMap = {
      'weekly': 7,
      'monthly': 30,
      'quarterly': 90,
      'yearly': 365
    };
    plan.durationInDays = durationMap[plan.duration] || 30;
  }
});

// Method to get formatted price
SubscriptionPlan.prototype.getFormattedPrice = function() {
  return `${parseFloat(this.price).toLocaleString()} ${this.currency}`;
};

// Method to get price per day
SubscriptionPlan.prototype.getPricePerDay = function() {
  return (parseFloat(this.price) / this.durationInDays).toFixed(2);
};

// Method to check if plan has available slots
SubscriptionPlan.prototype.hasAvailableSlots = function() {
  if (this.maxSubscribers === null) return true;
  return this.currentSubscribers < this.maxSubscribers;
};

// Method to get active discount
SubscriptionPlan.prototype.getActiveDiscount = function() {
  const now = new Date();
  return this.discounts.find(discount => 
    discount.isActive &&
    new Date(discount.validFrom) <= now &&
    new Date(discount.validUntil) >= now &&
    (!discount.maxUses || discount.currentUses < discount.maxUses)
  );
};

// Method to calculate discounted price
SubscriptionPlan.prototype.getDiscountedPrice = function() {
  const discount = this.getActiveDiscount();
  if (!discount) return parseFloat(this.price);
  
  const discountAmount = (parseFloat(this.price) * discount.percentage) / 100;
  return parseFloat(this.price) - discountAmount;
};

// Method to increment subscriber count
SubscriptionPlan.prototype.incrementSubscribers = async function() {
  this.currentSubscribers += 1;
  this.activeSubscribers += 1;
  this.totalSubscribers += 1;
  return await this.save();
};

// Method to decrement subscriber count
SubscriptionPlan.prototype.decrementSubscribers = async function() {
  this.currentSubscribers = Math.max(0, this.currentSubscribers - 1);
  this.activeSubscribers = Math.max(0, this.activeSubscribers - 1);
  return await this.save();
};

// Method to add revenue
SubscriptionPlan.prototype.addRevenue = async function(amount) {
  this.totalRevenue = parseFloat(this.totalRevenue) + parseFloat(amount);
  this.monthlyRevenue = parseFloat(this.monthlyRevenue) + parseFloat(amount);
  return await this.save();
};

module.exports = SubscriptionPlan;