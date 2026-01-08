const jwt = require('jsonwebtoken');

// Middleware para verificar JWT token
const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'tu_clave_secreta_super_segura'
    );

    // Agregar userId al request
    req.userId = decoded.userId;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware opcional de autenticación (permite requests sin token)
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'tu_clave_secreta_super_segura'
      );
      req.userId = decoded.userId;
    }
    
    next();
  } catch (error) {
    // Si hay error, simplemente continuar sin userId
    next();
  }
};

// Middleware para verificar roles de admin
const adminMiddleware = (req, res, next) => {
  // Este middleware debe ejecutarse después de authMiddleware
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado'
    });
  }

  // Aquí podrías verificar el rol del usuario desde la BD si es necesario
  // Por ahora asumimos que el token contiene la info necesaria
  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware
};