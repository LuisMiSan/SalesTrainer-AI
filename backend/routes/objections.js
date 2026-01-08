const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Objection = require('../models/Objection');

// GET /api/objections - Obtener todas las objeciones (públicas + del usuario)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, search, difficulty, frequency } = req.query;

    const filters = {};
    
    if (category) filters.category = category;
    if (difficulty) filters.difficulty = difficulty;
    if (frequency) filters.frequency = frequency;

    if (search) {
      filters.$text = { $search: search };
    }

    const objections = await Objection.findForUser(req.userId, filters)
      .sort({ createdAt: -1 });

    // Agrupar por categoría
    const grouped = objections.reduce((acc, obj) => {
      if (!acc[obj.category]) {
        acc[obj.category] = [];
      }
      acc[obj.category].push(obj);
      return acc;
    }, {});

    res.json({
      success: true,
      objections,
      grouped,
      total: objections.length
    });

  } catch (error) {
    console.error('Error obteniendo objeciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener objeciones',
      error: error.message
    });
  }
});

// GET /api/objections/category/:category - Obtener objeciones por categoría
router.get('/category/:category', authMiddleware, async (req, res) => {
  try {
    const { category } = req.params;

    const objections = await Objection.findForUser(req.userId, { category })
      .sort({ 'stats.timesEncountered': -1 });

    res.json({
      success: true,
      category,
      objections,
      total: objections.length
    });

  } catch (error) {
    console.error('Error obteniendo objeciones por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener objeciones',
      error: error.message
    });
  }
});

// GET /api/objections/:id - Obtener una objeción específica
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const objection = await Objection.findById(req.params.id);

    if (!objection) {
      return res.status(404).json({
        success: false,
        message: 'Objeción no encontrada'
      });
    }

    // Verificar permisos (debe ser pública o del usuario)
    if (!objection.isPublic && objection.userId?.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta objeción'
      });
    }

    res.json({
      success: true,
      objection
    });

  } catch (error) {
    console.error('Error obteniendo objeción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener objeción',
      error: error.message
    });
  }
});

// POST /api/objections - Crear nueva objeción
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      responses,
      examples,
      tags,
      difficulty,
      frequency,
      isPublic
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Título, descripción y categoría son requeridos'
      });
    }

    const objection = new Objection({
      userId: req.userId,
      title,
      description,
      category,
      responses: responses || [],
      examples: examples || [],
      tags: tags || [],
      difficulty: difficulty || 'media',
      frequency: frequency || 'ocasional',
      isPublic: isPublic || false
    });

    await objection.save();

    res.status(201).json({
      success: true,
      message: 'Objeción creada exitosamente',
      objection
    });

  } catch (error) {
    console.error('Error creando objeción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear objeción',
      error: error.message
    });
  }
});

// PUT /api/objections/:id - Actualizar objeción
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const objection = await Objection.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!objection) {
      return res.status(404).json({
        success: false,
        message: 'Objeción no encontrada o no tienes permiso para editarla'
      });
    }

    const allowedFields = [
      'title', 'description', 'category', 'responses',
      'examples', 'tags', 'difficulty', 'frequency', 'isPublic'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        objection[field] = req.body[field];
      }
    });

    await objection.save();

    res.json({
      success: true,
      message: 'Objeción actualizada exitosamente',
      objection
    });

  } catch (error) {
    console.error('Error actualizando objeción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar objeción',
      error: error.message
    });
  }
});

// DELETE /api/objections/:id - Eliminar objeción
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const objection = await Objection.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!objection) {
      return res.status(404).json({
        success: false,
        message: 'Objeción no encontrada o no tienes permiso para eliminarla'
      });
    }

    res.json({
      success: true,
      message: 'Objeción eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando objeción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar objeción',
      error: error.message
    });
  }
});

// POST /api/objections/:id/responses - Agregar respuesta a una objeción
router.post('/:id/responses', authMiddleware, async (req, res) => {
  try {
    const { title, content, technique, effectiveness } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'El contenido de la respuesta es requerido'
      });
    }

    const objection = await Objection.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!objection) {
      return res.status(404).json({
        success: false,
        message: 'Objeción no encontrada o no tienes permiso'
      });
    }

    objection.responses.push({
      title,
      content,
      technique,
      effectiveness: effectiveness || 3,
      createdAt: new Date()
    });

    await objection.save();

    res.json({
      success: true,
      message: 'Respuesta agregada exitosamente',
      response: objection.responses[objection.responses.length - 1]
    });

  } catch (error) {
    console.error('Error agregando respuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar respuesta',
      error: error.message
    });
  }
});

// POST /api/objections/:id/track - Registrar encuentro con objeción
router.post('/:id/track', authMiddleware, async (req, res) => {
  try {
    const { successful } = req.body;

    const objection = await Objection.findById(req.params.id);

    if (!objection) {
      return res.status(404).json({
        success: false,
        message: 'Objeción no encontrada'
      });
    }

    objection.stats.timesEncountered += 1;
    if (successful) {
      objection.stats.timesSuccessful += 1;
    }

    await objection.save();

    res.json({
      success: true,
      message: 'Encuentro registrado',
      stats: objection.stats
    });

  } catch (error) {
    console.error('Error registrando encuentro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar encuentro',
      error: error.message
    });
  }
});

// GET /api/objections/stats/summary - Estadísticas de objeciones
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const userObjections = await Objection.find({ userId: req.userId });

    const totalObjections = userObjections.length;
    const byCategory = {};
    const byDifficulty = {};
    let totalEncounters = 0;
    let totalSuccessful = 0;

    userObjections.forEach(obj => {
      // Por categoría
      byCategory[obj.category] = (byCategory[obj.category] || 0) + 1;
      
      // Por dificultad
      byDifficulty[obj.difficulty] = (byDifficulty[obj.difficulty] || 0) + 1;
      
      // Estadísticas totales
      totalEncounters += obj.stats.timesEncountered;
      totalSuccessful += obj.stats.timesSuccessful;
    });

    const successRate = totalEncounters > 0 
      ? ((totalSuccessful / totalEncounters) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      stats: {
        totalObjections,
        totalEncounters,
        totalSuccessful,
        successRate: parseFloat(successRate),
        byCategory,
        byDifficulty
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