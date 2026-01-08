const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Meeting = require('../models/Meeting');
const Lead = require('../models/Lead');

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
      attendees
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

    const meeting = new Meeting({
      userId: req.userId,
      leadId,
      title,
      type: type || 'llamada',
      scheduledDate,
      duration: duration || 30,
      notes: notes || '',
      attendees: attendees || [],
      status: 'programada'
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
      'attendees', 'keyPoints', 'objections', 'followUpDate'
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
    const { notes, nextActions, outcome, leadStatusAfter, followUpDate } = req.body;

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