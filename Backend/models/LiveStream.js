const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LiveStream = sequelize.define('LiveStream', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'creator_id',
    references: { model: 'users', key: 'id' },
  },
  title: {
    type: DataTypes.STRING(160),
    allowNull: false,
  },
  description: DataTypes.TEXT,
  provider: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  providerStreamId: {
    type: DataTypes.STRING,
    field: 'provider_stream_id',
  },
  streamKey: {
    type: DataTypes.TEXT,
    field: 'stream_key',
  },
  ingestUrl: {
    type: DataTypes.TEXT,
    field: 'ingest_url',
  },
  playbackUrl: {
    type: DataTypes.TEXT,
    field: 'playback_url',
  },
  status: {
    type: DataTypes.ENUM('idle', 'live', 'ended', 'error'),
    defaultValue: 'idle',
  },
  viewerCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'viewer_count',
  },
  startedAt: {
    type: DataTypes.DATE,
    field: 'started_at',
  },
  endedAt: {
    type: DataTypes.DATE,
    field: 'ended_at',
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'live_streams',
  underscored: true,
  indexes: [
    { fields: ['creator_id', 'status'] },
    { fields: ['status', 'started_at'] },
  ],
});

module.exports = LiveStream;
