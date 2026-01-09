const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Generar JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'tu_clave_secreta_super_segura',
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register - Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company, username } = req.body;

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Verificar si el username ya existe (si se provee)
    if (username) {
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario ya está en uso'
            });
        }
    }

    // Crear usuario
    const user = new User({
      name,
      email,
      password,
      company,
      username
    });

    await user.save();

    // Generar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
});

// POST /api/auth/login - Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario (incluir password)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar último login
    user.lastLogin = Date.now();
    await user.save();

    // Generar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
});

// GET /api/auth/me - Obtener usuario actual
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del usuario',
      error: error.message
    });
  }
});

// PUT /api/auth/profile - Actualizar perfil
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, company, avatar, preferences, username, email } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Check username uniqueness if changing
    if (username && username !== user.username) {
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ success: false, message: 'El nombre de usuario ya está en uso' });
        }
        user.username = username;
    }

    // Check email uniqueness if changing (optional, usually requires verification)
    if (email && email !== user.email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'El email ya está en uso' });
        }
        user.email = email;
    }

    // Actualizar campos permitidos
    if (name) user.name = name;
    if (company) user.company = company;
    if (avatar) user.avatar = avatar;
    if (preferences) {
      // Deep merge for preferences
      user.preferences = {
        ...user.preferences,
        ...preferences,
        notifications: {
          ...user.preferences.notifications,
          ...(preferences.notifications || {})
        }
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
});

// PUT /api/auth/change-password - Cambiar contraseña
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva son requeridas'
      });
    }

    const user = await User.findById(req.userId).select('+password');
    
    // Verificar contraseña actual
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
});

module.exports = router;