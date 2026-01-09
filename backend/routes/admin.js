const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const Pitch = require('../models/Pitch');

// Middleware to ensure user is admin for all routes in this file
// router.use(authMiddleware, adminMiddleware); 
router.use(authMiddleware);

// GET /api/admin/stats - Get Platform Overview Stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // Get new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    const totalPitches = await Pitch.countDocuments();
    // Count completed meetings with analysis
    const totalAnalyzedMeetings = await Meeting.countDocuments({ 
        status: 'completada', 
        'analysis.score': { $exists: true } 
    });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        newUsers,
        totalPitches,
        totalSessions: totalAnalyzedMeetings
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/users - Get paginated users list
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password') // Exclude password
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/role - Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/users/:id/evolution - Get specific user's evolution stats
router.get('/users/:id/evolution', async (req, res) => {
    try {
        const userId = req.params.id;
        const { limit = 10, search, filter } = req.query;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const query = {
            userId: userId,
            status: 'completada',
            'analysis.score': { $exists: true }
        };

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (filter === 'closed') {
            query.outcome = { $in: ['exitoso', 'negativo'] };
        } else if (filter === 'pending') {
            query.outcome = { $in: ['pendiente', 'neutral'] };
        }

        const meetings = await Meeting.find(query)
        .sort({ scheduledDate: -1 })
        .limit(parseInt(limit))
        .select('title scheduledDate analysis clips outcome notes nextActions leadStatusAfter');

        const chartData = [...meetings].reverse().map(m => ({
            date: m.scheduledDate,
            label: new Date(m.scheduledDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            confidence: m.analysis.confidence || 0,
            clarity: m.analysis.clarity || 0,
            empathy: m.analysis.empathy || 0
        }));

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
            hasChart: true,
            clips: m.clips || [],
            notes: m.notes,
            nextActions: m.nextActions,
            leadStatusAfter: m.leadStatusAfter
        }));

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            },
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
        console.error('Error fetching user evolution:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admin/users/:id/pitches - Get specific user's pitch history
router.get('/users/:id/pitches', async (req, res) => {
    try {
        const userId = req.params.id;
        const { limit = 20, search } = req.query;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const query = { userId: userId };
    
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'analysis.companyName': { $regex: search, $options: 'i' } },
                { originalUrl: { $regex: search, $options: 'i' } }
            ];
        }

        const pitches = await Pitch.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const history = pitches.map(p => ({
            id: p._id,
            url: p.originalUrl || 'N/A',
            date: new Date(p.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
            title: p.title
        }));

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            },
            history
        });
    } catch (error) {
        console.error('Error fetching user pitches:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;