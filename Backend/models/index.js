const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');
const Content = require('./Content');
const SubscriptionPlan = require('./SubscriptionPlan');
const Comment = require('./Comment');
const Story = require('./Story');
const Message = require('./Message');
const Conversation = require('./Conversation');
const Notification = require('./Notification');
const UserSubscription = require('./UserSubscription');
const ContentPurchase = require('./ContentPurchase');

// Define associations
// User associations
User.hasOne(Wallet, {
  foreignKey: 'userId',
  as: 'wallet'
});

User.hasMany(Transaction, {
  foreignKey: 'userId',
  as: 'transactions'
});

User.hasMany(Content, {
  foreignKey: 'creatorId',
  as: 'content'
});

User.hasMany(SubscriptionPlan, {
  foreignKey: 'creatorId',
  as: 'subscriptionPlans'
});

// User self-referencing associations for followers/following
User.belongsToMany(User, {
  through: 'user_followers',
  as: 'followers',
  foreignKey: 'followedId',
  otherKey: 'followerId'
});

User.belongsToMany(User, {
  through: 'user_followers',
  as: 'following',
  foreignKey: 'followerId',
  otherKey: 'followedId'
});

// Wallet associations
Wallet.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Wallet.hasMany(Transaction, {
  foreignKey: 'walletId',
  as: 'transactions'
});

// Transaction associations
Transaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Transaction.belongsTo(Wallet, {
  foreignKey: 'walletId',
  as: 'wallet'
});

// Content associations
Content.belongsTo(User, {
  foreignKey: 'creatorId',
  as: 'creator'
});

Content.belongsTo(SubscriptionPlan, {
  foreignKey: 'requiredTierId',
  as: 'requiredTier'
});

// Content likes (many-to-many)
Content.belongsToMany(User, {
  through: 'content_likes',
  as: 'likedBy',
  foreignKey: 'contentId',
  otherKey: 'userId'
});

User.belongsToMany(Content, {
  through: 'content_likes',
  as: 'likedContent',
  foreignKey: 'userId',
  otherKey: 'contentId'
});

// SubscriptionPlan associations
SubscriptionPlan.belongsTo(User, {
  foreignKey: 'creatorId',
  as: 'creator'
});

SubscriptionPlan.hasMany(Content, {
  foreignKey: 'requiredTierId',
  as: 'content'
});

// User subscriptions (many-to-many)
User.belongsToMany(SubscriptionPlan, {
  through: 'user_subscriptions',
  as: 'subscriptions',
  foreignKey: 'userId',
  otherKey: 'planId'
});

SubscriptionPlan.belongsToMany(User, {
  through: 'user_subscriptions',
  as: 'subscribers',
  foreignKey: 'planId',
  otherKey: 'userId'
});

// Comment associations
Comment.belongsTo(Content, {
  foreignKey: 'contentId',
  as: 'content'
});

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

Comment.belongsTo(Comment, {
  foreignKey: 'parentCommentId',
  as: 'parentComment'
});

Comment.hasMany(Comment, {
  foreignKey: 'parentCommentId',
  as: 'replies'
});

Content.hasMany(Comment, {
  foreignKey: 'contentId',
  as: 'comments'
});

// Story associations
Story.belongsTo(User, {
  foreignKey: 'creatorId',
  as: 'creator'
});

User.hasMany(Story, {
  foreignKey: 'creatorId',
  as: 'stories'
});

// Conversation associations
Conversation.belongsToMany(User, {
  through: 'conversation_participants',
  as: 'participants',
  foreignKey: 'conversationId',
  otherKey: 'userId'
});

// Message associations
Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender'
});

Message.belongsTo(User, {
  foreignKey: 'recipientId',
  as: 'recipient'
});

Message.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation'
});

Conversation.hasMany(Message, {
  foreignKey: 'conversationId',
  as: 'messages'
});

// Notification associations
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Notification.belongsTo(User, {
  foreignKey: 'relatedUserId',
  as: 'relatedUser'
});

Notification.belongsTo(Content, {
  foreignKey: 'relatedContentId',
  as: 'relatedContent'
});

User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications'
});

// UserSubscription associations
UserSubscription.belongsTo(User, {
  foreignKey: 'userId',
  as: 'subscriber'
});

UserSubscription.belongsTo(SubscriptionPlan, {
  foreignKey: 'planId',
  as: 'plan'
});

UserSubscription.belongsTo(Transaction, {
  foreignKey: 'transactionId',
  as: 'transaction'
});

User.hasMany(UserSubscription, {
  foreignKey: 'userId',
  as: 'activeSubscriptions'
});

SubscriptionPlan.hasMany(UserSubscription, {
  foreignKey: 'planId',
  as: 'subscriptions'
});

// ContentPurchase associations
ContentPurchase.belongsTo(User, {
  foreignKey: 'userId',
  as: 'buyer'
});

ContentPurchase.belongsTo(Content, {
  foreignKey: 'contentId',
  as: 'content'
});

ContentPurchase.belongsTo(Transaction, {
  foreignKey: 'transactionId',
  as: 'transaction'
});

User.hasMany(ContentPurchase, {
  foreignKey: 'userId',
  as: 'purchases'
});

Content.hasMany(ContentPurchase, {
  foreignKey: 'contentId',
  as: 'purchases'
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Wallet,
  Transaction,
  Content,
  SubscriptionPlan,
  Comment,
  Story,
  Message,
  Conversation,
  Notification,
  UserSubscription,
  ContentPurchase
};
