const { query } = require('../config/database');

// Get all expediteurs with pagination
const getAllExpediteurs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const countResult = await query('SELECT COUNT(*) FROM expediteurs', []);
    const total = parseInt(countResult.rows[0].count);
    const expediteursResult = await query(
      'SELECT e.*, u.email, u.first_name, u.last_name, u.phone FROM expediteurs e JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.status(200).json({
      success: true,
      data: {
        expediteurs: expediteursResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all expediteurs error:', error);
    res.status(500).json({ success: false, error: 'Failed to get expediteurs' });
  }
};

// Get expediteur by ID
const getExpediteurById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT e.*, u.email, u.first_name, u.last_name, u.phone FROM expediteurs e JOIN users u ON e.user_id = u.id WHERE e.id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Expediteur not found' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get expediteur by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to get expediteur' });
  }
};

// Create expediteur
const createExpediteur = async (req, res) => {
  try {
    const { user_id, commercial_id, company_name, address, city, postal_code, country, is_verified } = req.body;
    // Check if user exists and is expediteur
    const userResult = await query('SELECT id, role FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'expediteur') {
      return res.status(400).json({ success: false, error: 'User must exist and have role expediteur' });
    }
    // Create expediteur profile
    const result = await query(
      'INSERT INTO expediteurs (user_id, commercial_id, company_name, address, city, postal_code, country, is_verified) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [user_id, commercial_id, company_name, address, city, postal_code, country, is_verified]
    );
    res.status(201).json({ success: true, message: 'Expediteur created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Create expediteur error:', error);
    res.status(500).json({ success: false, error: 'Failed to create expediteur' });
  }
};

// Update expediteur
const updateExpediteur = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const setClause = Object.keys(fields).map((key, idx) => `${key} = $${idx + 1}`).join(', ');
    const values = Object.values(fields);
    values.push(id);
    const result = await query(
      `UPDATE expediteurs SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Expediteur not found' });
    }
    res.status(200).json({ success: true, message: 'Expediteur updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Update expediteur error:', error);
    res.status(500).json({ success: false, error: 'Failed to update expediteur' });
  }
};

// Delete expediteur
const deleteExpediteur = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM expediteurs WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Expediteur not found' });
    }
    res.status(200).json({ success: true, message: 'Expediteur deleted successfully' });
  } catch (error) {
    console.error('Delete expediteur error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete expediteur' });
  }
};

// Get colis by expediteur
const getColisByExpediteur = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM colis WHERE expediteur_id = $1', [id]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get colis by expediteur error:', error);
    res.status(500).json({ success: false, error: 'Failed to get colis by expediteur' });
  }
};

// Get payments by expediteur
const getPaymentsByExpediteur = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM payments WHERE expediteur_id = $1', [id]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get payments by expediteur error:', error);
    res.status(500).json({ success: false, error: 'Failed to get payments by expediteur' });
  }
};

// Get expediteur statistics
const getExpediteurStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT COUNT(*) as total_colis, SUM(shipping_cost) as total_spent FROM colis WHERE expediteur_id = $1`,
      [id]
    );
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get expediteur statistics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get expediteur statistics' });
  }
};

// Advanced filtering
const getExpediteursByCommercial = async (req, res) => {
  try {
    const { commercial_id } = req.query;
    const result = await query('SELECT * FROM expediteurs WHERE commercial_id = $1', [commercial_id]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get expediteurs by commercial error:', error);
    res.status(500).json({ success: false, error: 'Failed to get expediteurs by commercial' });
  }
};

const getExpediteursByCity = async (req, res) => {
  try {
    const { city } = req.query;
    const result = await query('SELECT * FROM expediteurs WHERE city = $1', [city]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get expediteurs by city error:', error);
    res.status(500).json({ success: false, error: 'Failed to get expediteurs by city' });
  }
};

const getVerifiedExpediteurs = async (req, res) => {
  try {
    const result = await query('SELECT * FROM expediteurs WHERE is_verified = true', []);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get verified expediteurs error:', error);
    res.status(500).json({ success: false, error: 'Failed to get verified expediteurs' });
  }
};

// Verification management
const verifyExpediteur = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('UPDATE expediteurs SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Expediteur not found' });
    }
    res.status(200).json({ success: true, message: 'Expediteur verified', data: result.rows[0] });
  } catch (error) {
    console.error('Verify expediteur error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify expediteur' });
  }
};

const unverifyExpediteur = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('UPDATE expediteurs SET is_verified = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Expediteur not found' });
    }
    res.status(200).json({ success: true, message: 'Expediteur unverified', data: result.rows[0] });
  } catch (error) {
    console.error('Unverify expediteur error:', error);
    res.status(500).json({ success: false, error: 'Failed to unverify expediteur' });
  }
};

module.exports = {
  getAllExpediteurs,
  getExpediteurById,
  createExpediteur,
  updateExpediteur,
  deleteExpediteur,
  getColisByExpediteur,
  getPaymentsByExpediteur,
  getExpediteurStatistics,
  getExpediteursByCommercial,
  getExpediteursByCity,
  getVerifiedExpediteurs,
  verifyExpediteur,
  unverifyExpediteur
}; 