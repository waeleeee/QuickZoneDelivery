const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const db = require('../config/database');

const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('Administration', 'Commercial', 'Finance', 'Chef d\'agence', 'Membre de l\'agence', 'Livreurs', 'Expéditeur').required()
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user by email or username
    const userResult = await db.query(`
      SELECT 
        u.id, u.username, u.email, u.password_hash, u.first_name, u.last_name,
        u.phone, u.is_active, u.last_login,
        r.name as role, r.permissions
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE (u.email = $1 OR u.username = $1) AND u.is_active = true AND ur.is_active = true
    `, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Prepare user data for response
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      name: `${user.first_name} ${user.last_name}`,
      phone: user.phone,
      role: user.role,
      permissions: typeof user.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user.permissions,
      lastLogin: user.last_login
    };

    res.json({
      success: true,
      data: {
        accessToken: token,
        user: userData
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register endpoint (for admin use)
router.post('/register', async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password, first_name, last_name, phone, role } = value;

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Create user
      const userResult = await client.query(
        'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_active, email_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
        [username, email, hashedPassword, first_name, last_name, phone, true, true]
      );

      const userId = userResult.rows[0].id;

      // Get role ID
      const roleResult = await client.query('SELECT id FROM roles WHERE name = $1', [role]);
      if (roleResult.rows.length === 0) {
        throw new Error('Role not found');
      }

      const roleId = roleResult.rows[0].id;

      // Assign role to user
      await client.query(
        'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)',
        [userId, roleId, userId]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { userId, email, role }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await db.query(`
      SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name,
        u.phone, u.is_active, u.last_login, u.created_at,
        r.name as role, r.permissions
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1 AND u.is_active = true AND ur.is_active = true
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    user.permissions = typeof user.permissions === 'string' 
      ? JSON.parse(user.permissions) 
      : user.permissions;

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.last_login,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone } = req.body;

    const updateResult = await db.query(
      'UPDATE users SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [first_name, last_name, phone, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = updateResult.rows[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can log the logout event or invalidate tokens if needed
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get current user
    const userResult = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedNewPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router; 