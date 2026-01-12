const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const mongoose = require('mongoose');

// Modelo de sesión de práctica
const practiceSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pitchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pitch',
    default: null
  },
  type: {
    type: String,
    enum: ['pitch', 'objection', 'freestyle'],
    default: 'pitch'
  },
  audioUrl: String,
  transcription: String,
  improvedTranscription: String,
  duration: Number, // en segundos
  analysis: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    clarity: Number,
    pace: Number,
    confidence: Number,
    empathy: Number,
    persuasion: Number, // New
    tone: Number,       // New
    engagement: Number,
    fillerWords: Number,
    keywordUsage: Number
  },
  feedback: {
    strengths: [String],
    improvements: [{
      title: String,
      description: String,
      icon: String
    }],
    suggestions: [String]
  },
  clipDescriptions: {
    user: String,
    improved: String
  },
  metrics: {
    wordsPerMinute: Number,
    pauseCount: Number,
    averagePauseDuration: Number,
    volumeVariation: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PracticeSession = mongoose.model('PracticeSession', practiceSessionSchema);

// POST /api/practice/analyze - Analizar audio de práctica con IA
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { audioBase64, pitchId, type, targetText } = req.body;

    if (!audioBase64) {
      return res.status(400).json({
        success: false,
        message: 'Audio es requerido'
      });
    }

    // Aquí iría la integración con un servicio de speech-to-text
    // Por ahora simularemos la transcripción
    const transcription = "Transcripción simulada del audio...";

    // Análisis con IA (Claude)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Analiza esta práctica de pitch de ventas y proporciona feedback detallado.

Transcripción:
${transcription}

${targetText ? `Texto objetivo:\n${targetText}\n` : ''}

Evalúa en escala 0-100:
- Claridad: ¿Qué tan claro y comprensible es el mensaje?
- Ritmo: ¿El ritmo es apropiado (ni muy rápido ni muy lento)?
- Confianza: ¿Proyecta confianza y seguridad?
- Empatía: ¿Conecta emocionalmente y muestra comprensión?
- Persuasión: ¿Qué tan convincente es el argumento?
- Tono: ¿El tono es profesional y adecuado?

Proporciona:
- 3 fortalezas específicas
- 3 áreas de mejora (con título, descripción breve y sugerencia de icono material design)
- Una versión mejorada del texto que suene más profesional y persuasiva
- Descripción breve (3-5 palabras) del tono del usuario (ej: "Ritmo rápido y vacilante")
- Descripción breve del tono de la versión mejorada (ej: "Ritmo pausado y tono firme")

Responde SOLO con JSON válido:
{
  "score": 85,
  "clarity": 62,
  "pace": 70,
  "confidence": 85,
  "empathy": 91,
  "persuasion": 75,
  "tone": 80,
  "improvements": [
    {"title": "Aumentar la claridad", "description": "Usa frases más directas y pausas más cortas para proyectar mayor seguridad.", "icon": "campaign"},
    {"title": "Modulación de voz", "description": "Varía tu entonación para generar más interés y conectar mejor con el cliente.", "icon": "volume_up"}
  ],
  "improved_version": "Texto mejorado...",
  "clip_descriptions": {
    "user": "Ritmo rápido y vacilante",
    "improved": "Ritmo pausado y tono firme"
  }
}`
        }]
      })
    });

    const data = await response.json();
    let analysisText = data.content[0].text;
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(analysisText);

    // Guardar sesión de práctica
    const session = new PracticeSession({
      userId: req.userId,
      pitchId,
      type: type || 'pitch',
      transcription,
      improvedTranscription: analysis.improved_version,
      duration: 60, // Esto debería calcularse del audio
      analysis: {
        score: analysis.score,
        clarity: analysis.clarity,
        pace: analysis.pace,
        confidence: analysis.confidence,
        empathy: analysis.empathy,
        persuasion: analysis.persuasion || 75,
        tone: analysis.tone || 80,
        engagement: analysis.empathy, // Fallback
        fillerWords: 0,
        keywordUsage: 80
      },
      feedback: {
        strengths: [],
        improvements: analysis.improvements,
        suggestions: []
      },
      clipDescriptions: analysis.clip_descriptions,
      metrics: {
        wordsPerMinute: Math.round(transcription.split(' ').length / (60 / 60)),
        pauseCount: 0,
        averagePauseDuration: 0,
        volumeVariation: 50
      }
    });

    await session.save();

    // Actualizar estadísticas del usuario y Racha (Streak)
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    const userSessions = await PracticeSession.find({ userId: req.userId });
    const averageScore = userSessions.reduce((sum, s) => sum + s.analysis.score, 0) / userSessions.length;

    // Lógica de Racha
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newStreak = user.stats.streak || 0;
    let lastPractice = user.stats.lastPracticeDate ? new Date(user.stats.lastPracticeDate) : null;
    
    if (lastPractice) {
        lastPractice.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today - lastPractice);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays === 1) {
            // Practicó ayer, incrementa racha
            newStreak += 1;
        } else if (diffDays > 1) {
            // Rompió la racha, reinicia
            newStreak = 1;
        }
        // Si diffDays === 0 (practicó hoy), no cambia la racha
    } else {
        // Primera práctica
        newStreak = 1;
    }

    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'stats.totalPractices': 1 },
      $set: { 
          'stats.averageScore': Math.round(averageScore),
          'stats.streak': newStreak,
          'stats.lastPracticeDate': new Date()
      }
    });

    res.json({
      success: true,
      message: 'Análisis completado exitosamente',
      session: {
        id: session._id,
        transcription: session.transcription,
        improvedTranscription: session.improvedTranscription,
        analysis: session.analysis,
        feedback: session.feedback,
        clipDescriptions: session.clipDescriptions,
        metrics: session.metrics,
        createdAt: session.createdAt,
        newStreak // Devolvemos la nueva racha para animaciones en frontend
      }
    });

  } catch (error) {
    console.error('Error analizando práctica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al analizar práctica',
      error: error.message
    });
  }
});

// GET /api/practice/sessions - Obtener historial de sesiones
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;

    const query = { userId: req.userId };
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const sessions = await PracticeSession.find(query)
      .populate('pitchId', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await PracticeSession.countDocuments(query);

    res.json({
      success: true,
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo sesiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sesiones',
      error: error.message
    });
  }
});

// GET /api/practice/sessions/:id - Obtener sesión específica
router.get('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('pitchId');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    res.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sesión',
      error: error.message
    });
  }
});

// DELETE /api/practice/sessions/:id - Eliminar sesión
router.delete('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const session = await PracticeSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Sesión eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar sesión',
      error: error.message
    });
  }
});

// GET /api/practice/stats - Estadísticas de práctica
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const query = { userId: req.userId };
    
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const sessions = await PracticeSession.find(query);

    if (sessions.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalSessions: 0,
          averageScore: 0,
          totalDuration: 0,
          improvement: 0
        }
      });
    }

    const totalSessions = sessions.length;
    const averageScore = sessions.reduce((sum, s) => sum + s.analysis.score, 0) / totalSessions;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    // Calcular mejora (comparar primeras 5 vs últimas 5 sesiones)
    let improvement = 0;
    if (totalSessions >= 10) {
      const firstFive = sessions.slice(-5).reduce((sum, s) => sum + s.analysis.score, 0) / 5;
      const lastFive = sessions.slice(0, 5).reduce((sum, s) => sum + s.analysis.score, 0) / 5;
      improvement = lastFive - firstFive;
    }

    // Promedios por métrica
    const avgMetrics = {
      clarity: sessions.reduce((sum, s) => sum + s.analysis.clarity, 0) / totalSessions,
      pace: sessions.reduce((sum, s) => sum + s.analysis.pace, 0) / totalSessions,
      confidence: sessions.reduce((sum, s) => sum + s.analysis.confidence, 0) / totalSessions,
      empathy: sessions.reduce((sum, s) => sum + s.analysis.empathy, 0) / totalSessions,
      persuasion: sessions.reduce((sum, s) => sum + (s.analysis.persuasion || 0), 0) / totalSessions,
      tone: sessions.reduce((sum, s) => sum + (s.analysis.tone || 0), 0) / totalSessions
    };

    // Progresión en el tiempo
    const progression = sessions.slice(0, 10).reverse().map(s => ({
      date: s.createdAt,
      score: s.analysis.score
    }));

    res.json({
      success: true,
      stats: {
        totalSessions,
        averageScore: Math.round(averageScore),
        totalDuration: Math.round(totalDuration / 60), // en minutos
        improvement: Math.round(improvement),
        avgMetrics,
        progression
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

module.exports = router;