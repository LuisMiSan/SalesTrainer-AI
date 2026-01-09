const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Meeting = require('../models/Meeting');
const Lead = require('../models/Lead');
const User = require('../models/User');

// GET /api/meetings/evolution - Obtener historial de llamadas (gráficos y clips)
router.get('/evolution', authMiddleware, async (req, res) => {
  try {
    const { limit = 20, search, filter } = req.query;

    const query = {
        userId: req.userId,
        status: 'completada',
        'analysis.score': { $exists: true }
    };

    // Filtros
    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }

    if (filter === 'closed') {
        query.outcome = { $in: ['exitoso', 'negativo'] }; // Asumiendo cerrado = resultado final
    } else if (filter === 'pending') {
        query.outcome = { $in: ['pendiente', 'neutral'] };
    }

    // Buscar reuniones
    const meetings = await Meeting.find(query)
    .sort({ scheduledDate: -1 })
    .limit(parseInt(limit))
    .select('title scheduledDate analysis clips outcome notes nextActions leadStatusAfter');

    // Preparar datos para el gráfico (orden cronológico ascendente)
    // Nota: El gráfico global se eliminó del frontend principal, pero mantenemos la lógica por si se usa en reportes
    const chartData = [...meetings].reverse().map(m => ({
      date: m.scheduledDate,
      label: new Date(m.scheduledDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      confidence: m.analysis.confidence || 0,
      clarity: m.analysis.clarity || 0,
      empathy: m.analysis.empathy || 0
    }));

    // Formatear historial
    const history = meetings.map(m => ({
      id: m._id,
      title: m.title,
      date: new Date(m.scheduledDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: (m.outcome === 'exitoso' || m.outcome === 'negativo') ? 'closed' : 'pending',
      scores: {
        confidence: m.analysis.confidence || 0,
        clarity: m.analysis.clarity || 0,
        empathy: m.analysis.empathy || 0
      },
      hasChart: true, // Flag para mostrar gráfico individual
      clips: m.clips || [],
      notes: m.notes,
      nextActions: m.nextActions,
      leadStatusAfter: m.leadStatusAfter
    }));

    res.json({
      success: true,
      chart: {
        labels: chartData.map(d => d.label),
        datasets: {
          confidence: chartData.map(d => d.confidence),
          clarity: chartData.map(d => d.clarity),
          empathy: chartData.map(d => d.empathy)
        }
      },
      history
    });

  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message
    });
  }
});

// GET /api/meetings/:id/clips/:clipId - Obtener acceso a un clip específico
router.get('/:id/clips/:clipId', authMiddleware, async (req, res) => {
  try {
    const { id, clipId } = req.params;

    const meeting = await Meeting.findOne({
      _id: id,
      userId: req.userId
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Reunión no encontrada'
      });
    }

    const clip = meeting.clips.id(clipId);
    if (!clip) {
      return res.status(404).json({
        success: false,
        message: 'Clip no encontrado'
      });
    }

    // En un caso real, aquí se generaría una URL firmada de S3/GCS
    // Por ahora, devolvemos la URL almacenada o una simulada
    const secureUrl = clip.url || `https://api.perfectcall.ai/stream/${clipId}`;

    res.json({
      success: true,
      clip: {
        ...clip.toObject(),
        url: secureUrl,
        expiresAt: new Date(Date.now() + 3600000) // 1 hora
      }
    });

  } catch (error) {
    console.error('Error obteniendo clip:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clip',
      error: error.message
    });
  }
});

// POST /api/meetings - Crear nueva reunión
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      leadId,
      title,
      type,
      scheduledDate,
      duration,
      notes,
      attendees,
      reminderMinutes
    } = req.body;

    if (!leadId || !title || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Lead, título y fecha programada son requeridos'
      });
    }

    // Verificar que el lead pertenece al usuario
    const lead = await Lead.findOne({
      _id: leadId,
      userId: req.userId
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead no encontrado'
      });
    }

    // Obtener preferencia por defecto del usuario si no se especifica
    let finalReminder = reminderMinutes;
    if (finalReminder === undefined) {
      const user = await User.findById(req.userId);
      finalReminder = user.preferences?.notifications?.defaultReminderMinutes || 15;
    }

    const meeting = new Meeting({
      userId: req.userId,
      leadId,
      title,
      type: type || 'llamada',
      scheduledDate,
      duration: duration || 30,
      notes: notes || '',
      attendees: attendees || [],
      status: 'programada',
      reminderMinutes: finalReminder
    });

    await meeting.save();

    // Actualizar nextFollowUp del lead
    if (new Date(scheduledDate) > new Date()) {
      lead.nextFollowUp = scheduledDate;
      await lead.save();
    }

    res.status(201).json({
      success: true,
      message: 'Reunión creada exitosamente',
      meeting
    });

  } catch (error) {
    console.error('Error creando reunión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear reunión',
      error: error.message
    });
  }
});

// GET /api/meetings - Obtener todas las reuniones
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      leadId,
      status,
      type,
      fromDate,
      toDate,
      limit = 50,
      page = 1
    } = req.query;

    const query = { userId: req.userId };

    if (leadId) query.leadId = leadId;
    if (status) query.status = status;
    if (type) query.type = type;

    if (fromDate || toDate) {
      query.scheduledDate = {};
      if (fromDate) query.scheduledDate.$gte = new Date(fromDate);
      if (toDate) query.scheduledDate.$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;

    const meetings = await Meeting.find(query)
      .populate('leadId', 'name company email phone')
      .sort({ scheduledDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Meeting.countDocuments(query);

    res.json({
      success: true,
      meetings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo reuniones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reuniones',
      error: error.message
    });
  }
});

// GET /api/meetings/upcoming - Obtener próximas reuniones
router.get('/upcoming', authMiddleware, async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;

    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + parseInt(days));

    const meetings = await Meeting.find({
      userId: req.userId,
      status: 'programada',
      scheduledDate: {
        $gte: fromDate,
        $lte: toDate
      }
    })
      .populate('leadId', 'name company email phone status')
      .sort({ scheduledDate: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      meetings,
      total: meetings.length
    });

  } catch (error) {
    console.error('Error obteniendo próximas reuniones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener próximas reuniones',
      error: error.message
    });
  }
});

// GET /api/meetings/:id - Obtener una reunión específica
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('leadId');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Reunión no encontrada'
      });
    }

    res.json({
      success: true,
      meeting
    });

  } catch (error) {
    console.error('Error obteniendo reunión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reunión',
      error: error.message
    });
  }
});

// PUT /api/meetings/:id - Actualizar reunión
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Reunión no encontrada'
      });
    }

    const allowedFields = [
      'title', 'type', 'scheduledDate', 'duration', 'status',
      'notes', 'nextActions', 'outcome', 'leadStatusAfter',
      'attendees', 'keyPoints', 'objections', 'followUpDate',
      'reminderMinutes', 'analysis', 'clips'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        meeting[field] = req.body[field];
      }
    });

    await meeting.save();

    // Si se completó la reunión y hay un nuevo estado del lead, actualizarlo
    if (req.body.status === 'completada' && req.body.leadStatusAfter) {
      await Lead.findByIdAndUpdate(meeting.leadId, {
        status: req.body.leadStatusAfter,
        lastContact: new Date(),
        nextFollowUp: req.body.followUpDate || null
      });
    }

    res.json({
      success: true,
      message: 'Reunión actualizada exitosamente',
      meeting
    });

  } catch (error) {
    console.error('Error actualizando reunión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar reunión',
      error: error.message
    });
  }
});

// DELETE /api/meetings/:id - Eliminar reunión
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Reunión no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Reunión eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando reunión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar reunión',
      error: error.message
    });
  }
});

// POST /api/meetings/:id/complete - Completar reunión
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { notes, nextActions, outcome, leadStatusAfter, followUpDate, analysis, clips } = req.body;

    const meeting = await Meeting.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Reunión no encontrada'
      });
    }

    meeting.status = 'completada';
    meeting.notes = notes || meeting.notes;
    meeting.nextActions = nextActions || '';
    meeting.outcome = outcome || 'neutral';
    meeting.leadStatusAfter = leadStatusAfter || null;
    meeting.followUpDate = followUpDate || null;
    
    // Guardar análisis y clips si se envían
    if (analysis) meeting.analysis = analysis;
    if (clips) meeting.clips = clips;

    await meeting.save();

    // Actualizar el lead
    if (leadStatusAfter) {
      await Lead.findByIdAndUpdate(meeting.leadId, {
        status: leadStatusAfter,
        lastContact: new Date(),
        nextFollowUp: followUpDate || null
      });
    }

    res.json({
      success: true,
      message: 'Reunión completada exitosamente',
      meeting
    });

  } catch (error) {
    console.error('Error completando reunión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar reunión',
      error: error.message
    });
  }
});

// GET /api/meetings/stats/summary - Estadísticas de reuniones
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    
    const query = { userId: req.userId };
    
    if (fromDate || toDate) {
      query.scheduledDate = {};
      if (fromDate) query.scheduledDate.$gte = new Date(fromDate);
      if (toDate) query.scheduledDate.$lte = new Date(toDate);
    }

    const totalMeetings = await Meeting.countDocuments(query);

    const byStatus = await Meeting.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const byOutcome = await Meeting.aggregate([
      { $match: { ...query, status: 'completada' } },
      { $group: { _id: '$outcome', count: { $sum: 1 } } }
    ]);

    const byType = await Meeting.aggregate([
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalMeetings,
        byStatus,
        byOutcome,
        byType
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