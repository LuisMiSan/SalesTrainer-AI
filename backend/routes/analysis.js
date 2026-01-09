const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const { authMiddleware } = require('../middleware/auth');
const Pitch = require('../models/Pitch');
const User = require('../models/User');

// Servicio para analizar sitio web con IA
const analyzeWebsiteWithAI = async (url, htmlContent) => {
  try {
    // Llamada a la API de Anthropic Claude
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
          content: `Analiza el siguiente sitio web y genera un pitch de ventas profesional en español.

URL: ${url}

Contenido del sitio web (HTML):
${htmlContent.substring(0, 8000)} 

Por favor, proporciona:
1. Un pitch de ventas personalizado y persuasivo (200-300 palabras)
2. Nombre de la empresa
3. Industria
4. Producto/servicio principal
5. Público objetivo
6. 3-5 beneficios clave
7. 3-5 puntos de dolor que resuelven
8. Propuesta de valor única

Responde SOLO con un JSON válido con esta estructura:
{
  "pitch": "texto del pitch aquí...",
  "analysis": {
    "companyName": "",
    "industry": "",
    "mainProduct": "",
    "targetAudience": "",
    "keyBenefits": [],
    "painPoints": [],
    "uniqueValue": ""
  }
}`
        }]
      })
    });

    const data = await response.json();
    let responseText = data.content[0].text;
    
    // Limpiar markdown si existe
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(responseText);

  } catch (error) {
    console.error('Error en análisis con IA:', error);
    throw new Error('Error al analizar con IA: ' + error.message);
  }
};

// Función para obtener contenido de la web
const fetchWebsiteContent = async (url) => {
  try {
    // Asegurar que la URL tenga protocolo
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Extraer texto relevante
    $('script, style, noscript, iframe').remove();
    
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1 = $('h1').map((i, el) => $(el).text()).get().join(' ');
    const h2 = $('h2').map((i, el) => $(el).text()).get().slice(0, 5).join(' ');
    const paragraphs = $('p').map((i, el) => $(el).text()).get().slice(0, 10).join(' ');

    const content = `
      Title: ${title}
      Description: ${metaDescription}
      Headings: ${h1} ${h2}
      Content: ${paragraphs}
    `.substring(0, 10000);

    return {
      url,
      content,
      title
    };

  } catch (error) {
    console.error('Error obteniendo contenido web:', error.message);
    throw new Error('No se pudo acceder al sitio web: ' + error.message);
  }
};

// POST /api/analysis/website - Analizar sitio web y generar pitch
router.post('/website', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'La URL es requerida'
      });
    }

    // 1. Obtener contenido del sitio web
    const websiteData = await fetchWebsiteContent(url);

    // 2. Analizar con IA
    const aiResult = await analyzeWebsiteWithAI(url, websiteData.content);

    // 3. Crear y guardar el pitch
    const pitch = new Pitch({
      userId: req.userId,
      title: `Pitch para ${aiResult.analysis.companyName || 'Empresa'}`,
      content: aiResult.pitch,
      originalUrl: url,
      analysis: aiResult.analysis
    });

    await pitch.save();

    // 4. Actualizar estadísticas del usuario
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'stats.totalPitches': 1 }
    });

    res.json({
      success: true,
      message: 'Análisis completado exitosamente',
      pitch: {
        id: pitch._id,
        title: pitch.title,
        content: pitch.content,
        analysis: pitch.analysis,
        metadata: pitch.metadata,
        createdAt: pitch.createdAt
      }
    });

  } catch (error) {
    console.error('Error en análisis de sitio web:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al analizar el sitio web',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/analysis/pitches - Obtener todos los pitches del usuario
router.get('/pitches', authMiddleware, async (req, res) => {
  try {
    const { status, search, limit = 20, page = 1 } = req.query;

    const query = { userId: req.userId };
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'analysis.companyName': { $regex: search, $options: 'i' } },
        { originalUrl: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const pitches = await Pitch.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Pitch.countDocuments(query);

    res.json({
      success: true,
      pitches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo pitches:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pitches',
      error: error.message
    });
  }
});

// GET /api/analysis/pitches/:id - Obtener un pitch específico
router.get('/pitches/:id', authMiddleware, async (req, res) => {
  try {
    const pitch = await Pitch.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!pitch) {
      return res.status(404).json({
        success: false,
        message: 'Pitch no encontrado'
      });
    }

    res.json({
      success: true,
      pitch
    });

  } catch (error) {
    console.error('Error obteniendo pitch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pitch',
      error: error.message
    });
  }
});

// PUT /api/analysis/pitches/:id - Actualizar pitch
router.put('/pitches/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content, tags, isFavorite, status } = req.body;

    const pitch = await Pitch.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!pitch) {
      return res.status(404).json({
        success: false,
        message: 'Pitch no encontrado'
      });
    }

    // Guardar versión anterior si el contenido cambió
    if (content && content !== pitch.content) {
      pitch.versions.push({
        content: pitch.content,
        createdAt: new Date(),
        comment: 'Versión anterior'
      });
    }

    // Actualizar campos
    if (title) pitch.title = title;
    if (content) pitch.content = content;
    if (tags) pitch.tags = tags;
    if (typeof isFavorite === 'boolean') pitch.isFavorite = isFavorite;
    if (status) pitch.status = status;

    await pitch.save();

    res.json({
      success: true,
      message: 'Pitch actualizado exitosamente',
      pitch
    });

  } catch (error) {
    console.error('Error actualizando pitch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar pitch',
      error: error.message
    });
  }
});

// DELETE /api/analysis/pitches/:id - Eliminar pitch
router.delete('/pitches/:id', authMiddleware, async (req, res) => {
  try {
    const pitch = await Pitch.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!pitch) {
      return res.status(404).json({
        success: false,
        message: 'Pitch no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Pitch eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando pitch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar pitch',
      error: error.message
    });
  }
});

// POST /api/analysis/pitches/:id/use - Marcar pitch como usado
router.post('/pitches/:id/use', authMiddleware, async (req, res) => {
  try {
    const pitch = await Pitch.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!pitch) {
      return res.status(404).json({
        success: false,
        message: 'Pitch no encontrado'
      });
    }

    pitch.usageCount += 1;
    pitch.lastUsed = new Date();
    await pitch.save();

    res.json({
      success: true,
      message: 'Uso registrado',
      usageCount: pitch.usageCount
    });

  } catch (error) {
    console.error('Error registrando uso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar uso',
      error: error.message
    });
  }
});

module.exports = router;