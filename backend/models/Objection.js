const mongoose = require('mongoose');

const objectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null significa que es una objeción global del sistema
  },
  title: {
    type: String,
    required: [true, 'El título de la objeción es requerido'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida']
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: ['precio', 'necesidad', 'tiempo', 'competencia', 'presupuesto', 'indecisión', 'autoridad', 'otro'],
    default: 'otro'
  },
  responses: [{
    title: String,
    content: {
      type: String,
      required: true
    },
    technique: {
      type: String,
      enum: ['empatía', 'pregunta', 'reframe', 'evidencia', 'historia', 'otro']
    },
    effectiveness: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  examples: [{
    scenario: String,
    response: String
  }],
  tags: [String],
  difficulty: {
    type: String,
    enum: ['fácil', 'media', 'difícil'],
    default: 'media'
  },
  frequency: {
    type: String,
    enum: ['rara', 'ocasional', 'frecuente', 'muy frecuente'],
    default: 'ocasional'
  },
  isPublic: {
    type: Boolean,
    default: false // Las objeciones privadas solo las ve el usuario
  },
  stats: {
    timesEncountered: {
      type: Number,
      default: 0
    },
    timesSuccessful: {
      type: Number,
      default: 0
    }
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
objectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Índices
objectionSchema.index({ userId: 1, category: 1 });
objectionSchema.index({ isPublic: 1, category: 1 });
objectionSchema.index({ title: 'text', description: 'text' });

// Método estático para obtener objeciones (públicas + del usuario)
objectionSchema.statics.findForUser = function(userId, filters = {}) {
  const query = {
    $or: [
      { userId: userId },
      { isPublic: true, userId: null }
    ],
    ...filters
  };
  return this.find(query);
};

module.exports = mongoose.model('Objection', objectionSchema);