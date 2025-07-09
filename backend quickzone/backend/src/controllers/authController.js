const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const userResult = await query(
      'SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login (skip if column doesn't exist)
    try {
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
    } catch (error) {
      // Ignore if last_login column doesn't exist
      console.log('last_login column not available');
    }

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database (skip if column doesn't exist)
    try {
      await query(
        'UPDATE users SET refresh_token = $1 WHERE id = $2',
        [refreshToken, user.id]
      );
    } catch (error) {
      // Ignore if refresh_token column doesn't exist
      console.log('refresh_token column not available');
    }

    // Remove password from response
    delete user.password_hash;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role } = req.body;

    // Check if user already exists
    const existingUserResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userResult = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, role',
      [email, passwordHash, first_name, last_name, phone, role]
    );

    const user = userResult.rows[0];

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [refreshToken, user.id]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.is_active, u.last_login, u.created_at,
              c.commission_rate, c.total_commission_earned, c.total_parcels_brought,
              e.company_name, e.address, e.city, e.postal_code, e.country, e.is_verified,
              l.vehicle_type, l.vehicle_plate, l.license_number, l.is_available, l.rating
       FROM users u
       LEFT JOIN commercials c ON u.id = c.user_id
       LEFT JOIN expediteurs e ON u.id = e.user_id
       LEFT JOIN livreurs l ON u.id = l.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone } = req.body;

    const updateResult = await query(
      'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), phone = COALESCE($3, phone), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, email, first_name, last_name, phone, role',
      [first_name, last_name, phone, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }

    // Get current password hash
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists in database
    const userResult = await query(
      'SELECT id, refresh_token FROM users WHERE id = $1 AND refresh_token = $2',
      [decoded.userId, refreshToken]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = generateToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    // Update refresh token in database
    await query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [newRefreshToken, decoded.userId]
    );

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Refresh token expired'
      });
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token'
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear refresh token
    await query(
      'UPDATE users SET refresh_token = NULL WHERE id = $1',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const userResult = await query(
      'SELECT id, email, first_name FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if user exists or not
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token
    await query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, userResult.rows[0].id]
    );

    // TODO: Send email with reset link
    // For now, just return the token (in production, send via email)
    res.status(200).json({
      success: true,
      message: 'Password reset link sent',
      data: {
        resetToken // Remove this in production
      }
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }

    // Find user with valid reset token
    const userResult = await query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > CURRENT_TIMESTAMP',
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userResult.rows[0].id]
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, is_active } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (role) {
      paramCount++;
      whereClause += ` AND u.role = $${paramCount}`;
      params.push(role);
    }

    if (is_active !== undefined) {
      paramCount++;
      whereClause += ` AND u.is_active = $${paramCount}`;
      params.push(is_active === 'true');
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].count);

    // Get users
    paramCount++;
    const usersResult = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.is_active, u.last_login, u.created_at
       FROM users u ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    res.status(200).json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
};

// Get user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.is_active, u.last_login, u.created_at, u.updated_at
       FROM users u WHERE u.id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: userResult.rows[0]
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, role, is_active } = req.body;

    const updateResult = await query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           role = COALESCE($4, role),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, email, first_name, last_name, phone, role, is_active`,
      [first_name, last_name, phone, role, is_active, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteResult = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
}; 