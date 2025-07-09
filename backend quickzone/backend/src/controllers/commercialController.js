const { query } = require('../config/database');

// Get all commercials with pagination
const getAllCommercials = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const countResult = await query('SELECT COUNT(*) FROM commercials', []);
    const total = parseInt(countResult.rows[0].count);
    const commercialsResult = await query(
      `SELECT c.*, u.email, u.first_name, u.last_name, u.phone FROM commercials c JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.status(200).json({
      success: true,
      data: {
        commercials: commercialsResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all commercials error:', error);
    res.status(500).json({ success: false, error: 'Failed to get commercials' });
  }
};

// Get commercial by ID
const getCommercialById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT c.*, u.email, u.first_name, u.last_name, u.phone FROM commercials c JOIN users u ON c.user_id = u.id WHERE c.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Commercial not found' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get commercial by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to get commercial' });
  }
};

// Create commercial
const createCommercial = async (req, res) => {
  try {
    const { user_id, commission_rate } = req.body;
    // Check if user exists and is a commercial
    const userResult = await query('SELECT id, role FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'commercial') {
      return res.status(400).json({ success: false, error: 'User must exist and have role commercial' });
    }
    // Create commercial profile
    const result = await query(
      'INSERT INTO commercials (user_id, commission_rate) VALUES ($1, $2) RETURNING *',
      [user_id, commission_rate]
    );
    res.status(201).json({ success: true, message: 'Commercial created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Create commercial error:', error);
    res.status(500).json({ success: false, error: 'Failed to create commercial' });
  }
};

// Update commercial
const updateCommercial = async (req, res) => {
  try {
    const { id } = req.params;
    const { commission_rate } = req.body;
    const result = await query(
      'UPDATE commercials SET commission_rate = COALESCE($1, commission_rate), updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [commission_rate, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Commercial not found' });
    }
    res.status(200).json({ success: true, message: 'Commercial updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Update commercial error:', error);
    res.status(500).json({ success: false, error: 'Failed to update commercial' });
  }
};

// Delete commercial
const deleteCommercial = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM commercials WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Commercial not found' });
    }
    res.status(200).json({ success: true, message: 'Commercial deleted successfully' });
  } catch (error) {
    console.error('Delete commercial error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete commercial' });
  }
};

// Get expediteurs by commercial
const getExpediteursByCommercial = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM expediteurs WHERE commercial_id = $1', [id]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get expediteurs by commercial error:', error);
    res.status(500).json({ success: false, error: 'Failed to get expediteurs' });
  }
};

// Get commissions by commercial
const getCommissionsByCommercial = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM payments WHERE commercial_id = $1', [id]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get commissions by commercial error:', error);
    res.status(500).json({ success: false, error: 'Failed to get commissions' });
  }
};

// Get pending commissions
const getPendingCommissions = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM payments WHERE commercial_id = $1 AND commission_paid = false', [id]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get pending commissions error:', error);
    res.status(500).json({ success: false, error: 'Failed to get pending commissions' });
  }
};

// Pay commission
const payCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('UPDATE payments SET commission_paid = true WHERE commercial_id = $1 AND commission_paid = false RETURNING *', [id]);
    res.status(200).json({ success: true, message: 'Commissions marked as paid', data: result.rows });
  } catch (error) {
    console.error('Pay commission error:', error);
    res.status(500).json({ success: false, error: 'Failed to pay commission' });
  }
};

// Get commercial performance
const getCommercialPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT COUNT(*) as total_expediteurs, SUM(total_parcels_sent) as total_parcels, SUM(total_amount_spent) as total_revenue
       FROM expediteurs WHERE commercial_id = $1`,
      [id]
    );
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get commercial performance error:', error);
    res.status(500).json({ success: false, error: 'Failed to get commercial performance' });
  }
};

module.exports = {
  getAllCommercials,
  getCommercialById,
  createCommercial,
  updateCommercial,
  deleteCommercial,
  getExpediteursByCommercial,
  getCommissionsByCommercial,
  getPendingCommissions,
  payCommission,
  getCommercialPerformance
}; 