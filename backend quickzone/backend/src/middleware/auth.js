const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const userResult = await query(
      'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Check if user can manage target user (hierarchy-based permissions)
const canManageUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id || req.body.userId;
    
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'Target user ID required'
      });
    }

    // Get target user
    const targetUserResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [targetUserId]
    );

    if (targetUserResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Target user not found'
      });
    }

    const targetUser = targetUserResult.rows[0];
    const currentUser = req.user;

    // Define role hierarchy (higher roles can manage lower roles)
    const roleHierarchy = {
      'admin': ['admin', 'chef_agence', 'commercial', 'livreur', 'expediteur'],
      'chef_agence': ['commercial', 'livreur', 'expediteur'],
      'commercial': ['expediteur'],
      'livreur': [],
      'expediteur': []
    };

    const canManage = roleHierarchy[currentUser.role]?.includes(targetUser.role);

    if (!canManage) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to manage this user'
      });
    }

    req.targetUser = targetUser;
    next();
  } catch (error) {
    console.error('Can manage user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization error'
    });
  }
};

// Optional authentication (for public endpoints that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userResult = await query(
        'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
        req.user = userResult.rows[0];
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  authorize,
  canManageUser,
  optionalAuth
}; 