const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Lead = require('../models/Lead');
const User = require('../models/User');

// POST /api/leads - Crear nuevo lead
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      position,
      status,
      priority,
      source,
      estimatedValue,
      tags,
      nextFollowUp,
      customFields
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del lead es requerido'
      });
    }

    const lead = new Lead({
      userId: req.userId,
      name,
      email,
      phone,
      company,
      position,
      status: status || 'nuevo',
      priority: priority || 'media',
      source,
      estimatedValue,
      tags,
      nextFollowUp,
      customFields
    });

    await lead.save();

    // Actualizar estadísticas del usuario
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'stats.totalLeads': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Lead creado exitosamente',
      lead
    });

  } catch (error) {
    console.error('Error creando lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear lead',
      error: error.message
    });
  }
});

// GET /api/leads - Obtener todos los leads
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      status,
      priority,
      source,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      limit = 50,
      page = 1
    } = req.query;

    const query = { userId: req.userId };

    // Filtros
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (source) query.source = source;

    // Búsqueda por texto
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    const leads = await Lead.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Lead.countDocuments(query);

    // Estadísticas por estado
    const statusStats = await Lead.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      leads,
      stats: statusStats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener leads',
      error: error.message
    });
  }
});

// GET /api/leads/:id - Obtener un lead específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead no encontrado'
      });
    }

    res.json({
      success: true,
      lead
    });

  } catch (error) {
    console.error('Error obteniendo lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lead',
      error: error.message
    });
  }
});

// PUT /api/leads/:id - Actualizar lead
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updateData = req.body;

    const lead = await Lead.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead no encontrado'
      });
    }

    // Actualizar campos permitidos
    const allowedFields = [
      'name', 'email', 'phone', 'company', 'position',
      'status', 'priority', 'source', 'estimatedValue',
      'tags', 'nextFollowUp', 'customFields'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        lead[field] = updateData[field];
      }
    });

    // Actualizar lastContact si cambió el estado
    if (updateData.status && updateData.status !== lead.status) {
      lead.lastContact = new Date();
    }

    await lead.save();

    res.json({
      success: true,
      message: 'Lead actualizado exitosamente',
      lead
    });

  } catch (error) {
    console.error('Error actualizando lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar lead',
      error: error.message
    });
  }
});

// DELETE /api/leads/:id - Eliminar lead
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead no encontrado'
      });
    }

    // Actualizar estadísticas
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'stats.totalLeads': -1 }
    });

    res.json({
      success: true,
      message: 'Lead eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar lead',
      error: error.message
    });
  }
});

// POST /api/leads/:id/notes - Agregar nota a un lead
router.post('/:id/notes', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'El contenido de la nota es requerido'
      });
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead no encontrado'
      });
    }

    lead.notes.push({
      content,
      createdBy: req.userId,
      createdAt: new Date()
    });

    lead.lastContact = new Date();
    await lead.save();

    res.json({
      success: true,
      message: 'Nota agregada exitosamente',
      note: lead.notes[lead.notes.length - 1]
    });

  } catch (error) {
    console.error('Error agregando nota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar nota',
      error: error.message
    });
  }
});

// GET /api/leads/stats/dashboard - Obtener estadísticas del dashboard
router.get('/stats/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Total de leads
    const totalLeads = await Lead.countDocuments({ userId });

    // Leads por estado
    const leadsByStatus = await Lead.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Leads por prioridad
    const leadsByPriority = await Lead.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Valor total estimado
    const totalValue = await Lead.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
    ]);

    // Próximos follow-ups
    const upcomingFollowUps = await Lead.find({
      userId,
      nextFollowUp: { $gte: new Date() }
    })
      .sort({ nextFollowUp: 1 })
      .limit(5)
      .select('name company nextFollowUp status');

    res.json({
      success: true,
      stats: {
        totalLeads,
        leadsByStatus,
        leadsByPriority,
        totalEstimatedValue: totalValue[0]?.total || 0,
        upcomingFollowUps
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