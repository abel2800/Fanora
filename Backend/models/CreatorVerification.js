const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CreatorVerification = sequelize.define('CreatorVerification', {
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
    references: { model: 'users', key: 'id' },
  },
  idType: {
    type: DataTypes.ENUM('fayda', 'kebele', 'passport'),
    field: 'id_type',
  },
  idFrontUrl: {
    type: DataTypes.TEXT,
    field: 'id_front_url',
  },
  idBackUrl: {
    type: DataTypes.TEXT,
    field: 'id_back_url',
  },
  selfieUrl: {
    type: DataTypes.TEXT,
    field: 'selfie_url',
  },
  livenessChallenge: {
    type: DataTypes.JSONB,
    field: 'liveness_challenge',
  },
  ocrData: {
    type: DataTypes.JSONB,
    field: 'ocr_data',
  },
  faceSimilarity: {
    type: DataTypes.DECIMAL(5, 4),
    field: 'face_similarity',
  },
  livenessScore: {
    type: DataTypes.DECIMAL(5, 4),
    field: 'liveness_score',
  },
  automatedChecks: {
    type: DataTypes.JSONB,
    field: 'automated_checks',
  },
  analyzedAt: {
    type: DataTypes.DATE,
    field: 'analyzed_at',
  },
  analysisStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
    field: 'analysis_status',
  },
  payoutMethod: {
    type: DataTypes.ENUM('telebirr', 'cbe', 'hellocash', 'agent'),
    field: 'payout_method',
  },
  payoutDetails: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'payout_details',
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'reviewing', 'approved', 'rejected'),
    defaultValue: 'draft',
  },
  currentStep: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'current_step',
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    field: 'rejection_reason',
  },
  submittedAt: {
    type: DataTypes.DATE,
    field: 'submitted_at',
  },
  reviewedAt: {
    type: DataTypes.DATE,
    field: 'reviewed_at',
  },
}, {
  tableName: 'creator_verifications',
  underscored: true,
});

module.exports = CreatorVerification;
