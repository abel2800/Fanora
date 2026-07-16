const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WishlistItem = sequelize.define('WishlistItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: { model: 'users', key: 'id' },
  },
  contentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'content_id',
    references: { model: 'content', key: 'id' },
  },
}, {
  tableName: 'wishlist_items',
  underscored: true,
  indexes: [{ unique: true, fields: ['user_id', 'content_id'] }],
});

module.exports = WishlistItem;
