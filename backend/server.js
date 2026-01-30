const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');
const leadsRoutes = require('./routes/leads');
const objectionsRoutes = require('./routes/objections');
const meetingsRoutes = require('./routes/meetings');
const practiceRoutes = require('./routes/practice');
const adminRoutes = require('./routes/admin');

const app = express();

// ===== MIDDLEWARES =====
app.use(helmet()); // Seguridad HTTP headers

// Configuración CORS permisiva para desarrollo
app.use(cors({
  origin: true, // Permitir cualquier origen
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
});
app.use('/api/', limiter);

// ===== CONEXIÓN A BASE DE DATOS =====
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/perfectcall_ai', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch((err) => console.error('❌ Error de conexión a MongoDB:', err));

// ===== RUTAS =====
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/objections', objectionsRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});