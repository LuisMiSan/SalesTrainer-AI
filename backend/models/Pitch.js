const mongoose = require('mongoose');

const pitchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    default: null
  },
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'El contenido del pitch es requerido']
  },
  source: {
    type: String,
    enum: ['web', 'manual'],
    default: 'web'
  },
  originalUrl: {
    type: String,
    trim: true
  },
  analysis: {
    companyName: String,
    industry: String,
    mainProduct: String,
    targetAudience: String,
    keyBenefits: [String],
    painPoints: [String],
    competitors: [String],
    uniqueValue: String
  },
  metadata: {
    wordCount: Number,
    estimatedDuration: Number, // en segundos
    tone: {
      type: String,
      enum: ['formal', 'casual', 'técnico', 'persuasivo'],
      default: 'formal'
    },
    language: {
      type: String,
      default: 'es'
    }
  },
  versions: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    comment: String
  }],
  tags: [String],
  isFavorite: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'pending_review', 'reviewed'],
    default: 'active'
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
pitchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calcular metadata automáticamente
  if (this.content) {
    this.metadata.wordCount = this.content.split(/\s+/).length;
    this.metadata.estimatedDuration = Math.ceil(this.metadata.wordCount / 2.5); // ~150 palabras por minuto
  }
  
  next();
});

// Índices
pitchSchema.index({ userId: 1, status: 1 });
pitchSchema.index({ userId: 1, createdAt: -1 });
pitchSchema.index({ title: 'text', 'analysis.companyName': 'text' });

module.exports = mongoose.model('Pitch', pitchSchema);