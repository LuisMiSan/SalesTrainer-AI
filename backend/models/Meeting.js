const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true
  },
  type: {
    type: String,
    enum: ['llamada', 'videollamada', 'presencial', 'email', 'otro'],
    default: 'llamada'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // en minutos
    default: 30
  },
  status: {
    type: String,
    enum: ['programada', 'completada', 'cancelada', 'reprogramada'],
    default: 'programada'
  },
  notes: {
    type: String,
    default: ''
  },
  nextActions: {
    type: String,
    default: ''
  },
  outcome: {
    type: String,
    enum: ['exitoso', 'neutral', 'negativo', 'pendiente'],
    default: 'pendiente'
  },
  leadStatusAfter: {
    type: String,
    enum: ['nuevo', 'contactado', 'reunión', 'propuesta', 'negociación', 'ganado', 'perdido'],
    default: null
  },
  attendees: [{
    name: String,
    email: String,
    role: String
  }],
  recording: {
    url: String,
    duration: Number,
    transcription: String
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  keyPoints: [String],
  objections: [{
    objectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Objection'
    },
    handled: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  followUpDate: {
    type: Date,
    default: null
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
meetingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Índices
meetingSchema.index({ userId: 1, scheduledDate: -1 });
meetingSchema.index({ leadId: 1, scheduledDate: -1 });
meetingSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);