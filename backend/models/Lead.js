const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'El nombre del lead es requerido'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  company: {
    name: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      trim: true
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      default: null
    }
  },
  position: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['nuevo', 'contactado', 'reunión', 'propuesta', 'negociación', 'ganado', 'perdido'],
    default: 'nuevo'
  },
  priority: {
    type: String,
    enum: ['baja', 'media', 'alta'],
    default: 'media'
  },
  source: {
    type: String,
    enum: ['web', 'referido', 'linkedin', 'email', 'llamada', 'evento', 'otro'],
    default: 'otro'
  },
  estimatedValue: {
    type: Number,
    default: 0
  },
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  tags: [String],
  nextFollowUp: {
    type: Date,
    default: null
  },
  lastContact: {
    type: Date,
    default: Date.now
  },
  customFields: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Actualizar updatedAt antes de guardar
leadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Índices para búsqueda rápida
leadSchema.index({ userId: 1, status: 1 });
leadSchema.index({ userId: 1, createdAt: -1 });
leadSchema.index({ 'company.name': 'text', name: 'text' });

module.exports = mongoose.model('Lead', leadSchema);