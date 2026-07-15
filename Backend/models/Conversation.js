const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  participantIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: false,
    field: 'participant_ids',
  },
  lastMessageId: {
    type: DataTypes.UUID,
    field: 'last_message_id',
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    field: 'last_message_at',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'conversations',
  indexes: [
    { fields: ['participant_ids'] },
    { fields: ['last_message_at'] },
  ],
});

module.exports = Conversation;
