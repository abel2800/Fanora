const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Content = sequelize.define('Content', {
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
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.ENUM('image', 'video', 'audio', 'text', 'live_stream'),
    allowNull: false,
  },
  // Media information
  mediaUrl: {
    type: DataTypes.TEXT,
    field: 'media_url',
  },
  mediaPublicId: {
    type: DataTypes.STRING,
    field: 'media_public_id',
  },
  thumbnailUrl: {
    type: DataTypes.TEXT,
    field: 'thumbnail_url',
  },
  mediaDuration: {
    type: DataTypes.INTEGER,
    field: 'media_duration',
  },
  mediaSize: {
    type: DataTypes.BIGINT,
    field: 'media_size',
  },
  mediaFormat: {
    type: DataTypes.STRING,
    field: 'media_format',
  },
  mediaWidth: {
    type: DataTypes.INTEGER,
    field: 'media_width',
  },
  mediaHeight: {
    type: DataTypes.INTEGER,
    field: 'media_height',
  },
  // Text content
  textContent: {
    type: DataTypes.TEXT,
    field: 'text_content',
    validate: {
      len: [0, 5000],
    },
  },
  // Access control
  accessType: {
    type: DataTypes.ENUM('free', 'premium', 'pay_per_view'),
    defaultValue: 'free',
    field: 'access_type',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB',
  },
  requiredTierId: {
    type: DataTypes.UUID,
    field: 'required_tier_id',
  },
  // Content status
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived', 'under_review', 'rejected'),
    defaultValue: 'draft',
  },
  isExplicit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_explicit',
  },
  ageRestriction: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'age_restriction',
    validate: {
      isIn: [[0, 18, 21]],
    },
  },
  // Engagement statistics
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'views_count',
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'likes_count',
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'comments_count',
  },
  sharesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'shares_count',
  },
  purchasesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'purchases_count',
  },
  revenue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  // Content metadata
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  category: {
    type: DataTypes.ENUM(
      'fitness', 'lifestyle', 'fashion', 'beauty', 'cooking', 'travel',
      'music', 'dance', 'comedy', 'education', 'art', 'photography',
      'gaming', 'sports', 'technology', 'business', 'other'
    ),
  },
  // Scheduling
  scheduledPublishDate: {
    type: DataTypes.DATE,
    field: 'scheduled_publish_date',
  },
  publishedAt: {
    type: DataTypes.DATE,
    field: 'published_at',
  },
  // Series information
  seriesName: {
    type: DataTypes.STRING,
    field: 'series_name',
  },
  seriesEpisode: {
    type: DataTypes.INTEGER,
    field: 'series_episode',
  },
  seriesSeason: {
    type: DataTypes.INTEGER,
    field: 'series_season',
  },
  // Monetization settings
  allowComments: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'allow_comments',
  },
  allowTips: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'allow_tips',
  },
  suggestedTipAmounts: {
    type: DataTypes.ARRAY(DataTypes.DECIMAL),
    field: 'suggested_tip_amounts',
    defaultValue: [],
  },
  exclusiveContent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'exclusive_content',
  },
  // Content warnings
  contentWarnings: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    field: 'content_warnings',
    defaultValue: [],
  },
  // Analytics
  totalWatchTime: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    field: 'total_watch_time',
  },
  averageWatchTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'average_watch_time',
  },
  completionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'completion_rate',
  },
  retentionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'retention_rate',
  },
  // SEO
  slug: {
    type: DataTypes.STRING,
    unique: true,
  },
  metaDescription: {
    type: DataTypes.STRING(160),
    field: 'meta_description',
  },
  keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
}, {
  tableName: 'content',
  indexes: [
    { fields: ['creator_id', 'created_at'] },
    { fields: ['status', 'published_at'] },
    { fields: ['type'] },
    { fields: ['access_type'] },
    { fields: ['category'] },
    { fields: ['tags'] },
    { fields: ['slug'] },
    { fields: ['is_explicit'] },
    { fields: ['views_count'] },
    { fields: ['likes_count'] },
  ],
});

// Generate slug before creating
Content.beforeCreate(async (content) => {
  if (!content.slug && content.title) {
    content.slug = content.title
      .toLowerCase()
      .trim()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  // Set published date when status changes to published
  if (content.status === 'published' && !content.publishedAt) {
    content.publishedAt = new Date();
  }
});

// Update published date when status changes
Content.beforeUpdate(async (content) => {
  if (content.changed('status') && content.status === 'published' && !content.publishedAt) {
    content.publishedAt = new Date();
  }
});

// Method to increment view count
Content.prototype.incrementViews = async function() {
  this.viewsCount += 1;
  return await this.save();
};

// Method to get formatted price
Content.prototype.getFormattedPrice = function() {
  if (this.price === 0) return 'Free';
  return `${parseFloat(this.price).toLocaleString()} ${this.currency}`;
};

module.exports = Content;