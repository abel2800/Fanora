const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomRequest = sequelize.define('CustomRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fanId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'fan_id',
    references: { model: 'users', key: 'id' },
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'creator_id',
    references: { model: 'users', key: 'id' },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  offeredPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'offered_price',
  },
  counterPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'counter_price',
  },
  status: {
    type: DataTypes.ENUM('requested', 'countered', 'accepted', 'declined', 'delivered', 'cancelled'),
    defaultValue: 'requested',
  },
  deliveryContentId: {
    type: DataTypes.UUID,
    field: 'delivery_content_id',
    references: { model: 'content', key: 'id' },
  },
  dueAt: {
    type: DataTypes.DATE,
    field: 'due_at',
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'paid', 'refunded'),
    defaultValue: 'unpaid',
    field: 'payment_status',
  },
  paidAt: {
    type: DataTypes.DATE,
    field: 'paid_at',
  },
}, {
  tableName: 'custom_requests',
  underscored: true,
  indexes: [
    { fields: ['fan_id', 'status'] },
    { fields: ['creator_id', 'status'] },
  ],
});

module.exports = CustomRequest;
