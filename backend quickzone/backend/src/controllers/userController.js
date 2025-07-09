const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all users with pagination and optional search
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, is_active } = req.query;
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;
    if (search) {
      paramCount++;
      whereClause += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      params.push(role);
    }
    if (is_active !== undefined) {
      paramCount++;
      whereClause += ` AND is_active = $${paramCount}`;
      params.push(is_active === 'true');
    }
    // Get total count
    const countResult = await query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);
    // Get users
    paramCount++;
    const usersResult = await query(
      `SELECT id, email, first_name, last_name, phone, role, is_active, last_login, created_at FROM users ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
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
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userResult = await query(
      'SELECT id, email, first_name, last_name, phone, role, is_active, last_login, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: userResult.rows[0] });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role } = req.body;
    // Check if user already exists
    const existingUserResult = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    // Create user
    const userResult = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, phone, role',
      [email, passwordHash, first_name, last_name, phone, role]
    );
    res.status(201).json({ success: true, message: 'User created successfully', data: userResult.rows[0] });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, role, is_active } = req.body;
    const updateResult = await query(
      `UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), phone = COALESCE($3, phone), role = COALESCE($4, role), is_active = COALESCE($5, is_active), updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, email, first_name, last_name, phone, role, is_active`,
      [first_name, last_name, phone, role, is_active, id]
    );
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User updated successfully', data: updateResult.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteResult = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
};

// Activate user
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User activated successfully' });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ success: false, error: 'Failed to activate user' });
  }
};

// Deactivate user
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ success: false, error: 'Failed to deactivate user' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser
}; 