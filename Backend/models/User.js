const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
      is: /^[a-zA-Z0-9_]+$/,
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255],
    },
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'first_name',
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'last_name',
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    allowNull: false,
    field: 'phone_number',
    validate: {
      is: /^(\+251|0)[1-9]\d{8}$/,
    },
  },
  profileImage: {
    type: DataTypes.TEXT,
    field: 'profile_image',
  },
  coverImage: {
    type: DataTypes.TEXT,
    field: 'cover_image',
  },
  bio: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 500],
    },
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date_of_birth',
  },
  isCreator: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_creator',
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified',
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_email_verified',
  },
  role: {
    type: DataTypes.ENUM('user', 'creator', 'admin'),
    defaultValue: 'user',
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    field: 'email_verification_token',
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    field: 'email_verification_expires',
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    field: 'password_reset_token',
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    field: 'password_reset_expires',
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      notifications: {
        email: true,
        push: true,
        newFollowers: true,
        newSubscribers: true,
      },
      privacy: {
        profileVisibility: 'public',
        showOnlineStatus: true,
      },
    },
  },
  lastActive: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'last_active',
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_online',
  },
}, {
  tableName: 'users',
  indexes: [
    { fields: ['email'] },
    { fields: ['username'] },
    { fields: ['is_creator'] },
    { fields: ['phone_number'] },
    { fields: ['is_verified'] },
    { fields: ['created_at'] },
  ],
});

// Virtual for full name
User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Compare password method
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active
User.prototype.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Check if user is adult (18+)
User.prototype.isAdult = function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
};

module.exports = User;