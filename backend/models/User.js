const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  username: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Permite valores nulos/únicos
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  company: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'es'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      practiceReminders: { type: Boolean, default: false },
      practiceFrequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
      aiFeedback: { type: Boolean, default: false },
      achievements: { type: Boolean, default: false },
      weeklySummary: { type: Boolean, default: false },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      defaultReminderMinutes: { type: Number, default: 15 }
    }
  },
  stats: {
    totalPitches: { type: Number, default: 0 },
    totalPractices: { type: Number, default: 0 },
    totalLeads: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastPracticeDate: { type: Date, default: null }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Encriptar password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos públicos del usuario
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    company: this.company,
    role: this.role,
    avatar: this.avatar,
    subscription: this.subscription,
    preferences: this.preferences,
    stats: this.stats,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);