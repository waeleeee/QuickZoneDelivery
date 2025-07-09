const { query } = require('../config/database');

// Get all colis with pagination
const getAllColis = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const countResult = await query('SELECT COUNT(*) FROM colis', []);
    const total = parseInt(countResult.rows[0].count);
    const colisResult = await query(
      'SELECT * FROM colis ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.status(200).json({
      success: true,
      data: {
        colis: colisResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all colis error:', error);
    res.status(500).json({ success: false, error: 'Failed to get colis' });
  }
};

// Get colis by ID
const getColisById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM colis WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Colis not found' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get colis by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to get colis' });
  }
};

// Create colis
const createColis = async (req, res) => {
  try {
    const {
      expediteur_id, livreur_id, commercial_id, weight, dimensions, description, declared_value,
      recipient_name, recipient_phone, recipient_address, recipient_city, recipient_postal_code,
      shipping_cost, estimated_delivery_date
    } = req.body;
    // Generate tracking number (simple example)
    const tracking_number = 'QZ' + Date.now();
    const result = await query(
      `INSERT INTO colis (
        tracking_number, expediteur_id, livreur_id, commercial_id, weight, dimensions, description, declared_value,
        recipient_name, recipient_phone, recipient_address, recipient_city, recipient_postal_code, shipping_cost, estimated_delivery_date
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [tracking_number, expediteur_id, livreur_id, commercial_id, weight, dimensions, description, declared_value,
        recipient_name, recipient_phone, recipient_address, recipient_city, recipient_postal_code, shipping_cost, estimated_delivery_date]
    );
    res.status(201).json({ success: true, message: 'Colis created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Create colis error:', error);
    res.status(500).json({ success: false, error: 'Failed to create colis' });
  }
};

// Update colis
const updateColis = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const setClause = Object.keys(fields).map((key, idx) => `${key} = $${idx + 1}`).join(', ');
    const values = Object.values(fields);
    values.push(id);
    const result = await query(
      `UPDATE colis SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Colis not found' });
    }
    res.status(200).json({ success: true, message: 'Colis updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Update colis error:', error);
    res.status(500).json({ success: false, error: 'Failed to update colis' });
  }
};

// Delete colis
const deleteColis = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM colis WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Colis not found' });
    }
    res.status(200).json({ success: true, message: 'Colis deleted successfully' });
  } catch (error) {
    console.error('Delete colis error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete colis' });
  }
};

// Track colis by tracking number
const trackColis = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const result = await query('SELECT * FROM colis WHERE tracking_number = $1', [trackingNumber]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Colis not found' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Track colis error:', error);
    res.status(500).json({ success: false, error: 'Failed to track colis' });
  }
};

// Get colis tracking history
const getColisTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM colis_tracking WHERE colis_id = $1 ORDER BY created_at ASC', [id]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get colis tracking error:', error);
    res.status(500).json({ success: false, error: 'Failed to get colis tracking' });
  }
};

// Add tracking event
const addTrackingEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, description } = req.body;
    const created_by = req.user.id;
    const result = await query(
      'INSERT INTO colis_tracking (colis_id, status, location, description, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, status, location, description, created_by]
    );
    res.status(201).json({ success: true, message: 'Tracking event added', data: result.rows[0] });
  } catch (error) {
    console.error('Add tracking event error:', error);
    res.status(500).json({ success: false, error: 'Failed to add tracking event' });
  }
};

// Assign colis to livreur/mission
const assignColis = async (req, res) => {
  try {
    const { id } = req.params;
    const { livreur_id, mission_id } = req.body;
    const result = await query(
      'UPDATE colis SET livreur_id = $1, mission_id = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [livreur_id, mission_id, 'assigned', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Colis not found' });
    }
    res.status(200).json({ success: true, message: 'Colis assigned successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Assign colis error:', error);
    res.status(500).json({ success: false, error: 'Failed to assign colis' });
  }
};

// Pickup colis (livreur)
const pickupColis = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE colis SET status = $1, picked_up_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['picked_up', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Colis not found' });
    }
    res.status(200).json({ success: true, message: 'Colis picked up', data: result.rows[0] });
  } catch (error) {
    console.error('Pickup colis error:', error);
    res.status(500).json({ success: false, error: 'Failed to pickup colis' });
  }
};

// Deliver colis (livreur)
const deliverColis = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE colis SET status = $1, delivered_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['delivered', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Colis not found' });
    }
    res.status(200).json({ success: true, message: 'Colis delivered', data: result.rows[0] });
  } catch (error) {
    console.error('Deliver colis error:', error);
    res.status(500).json({ success: false, error: 'Failed to deliver colis' });
  }
};

// Fail colis (livreur)
const failColis = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE colis SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['failed', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Colis not found' });
    }
    res.status(200).json({ success: true, message: 'Colis marked as failed', data: result.rows[0] });
  } catch (error) {
    console.error('Fail colis error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark colis as failed' });
  }
};

// Return colis (livreur)
const returnColis = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE colis SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['returned', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Colis not found' });
    }
    res.status(200).json({ success: true, message: 'Colis returned', data: result.rows[0] });
  } catch (error) {
    console.error('Return colis error:', error);
    res.status(500).json({ success: false, error: 'Failed to return colis' });
  }
};

// Get colis by expediteur
const getColisByExpediteur = async (req, res) => {
  try {
    const { expediteur_id } = req.query;
    const result = await query('SELECT * FROM colis WHERE expediteur_id = $1', [expediteur_id]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get colis by expediteur error:', error);
    res.status(500).json({ success: false, error: 'Failed to get colis by expediteur' });
  }
};

// Get colis by livreur
const getColisByLivreur = async (req, res) => {
  try {
    const { livreur_id } = req.query;
    const result = await query('SELECT * FROM colis WHERE livreur_id = $1', [livreur_id]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get colis by livreur error:', error);
    res.status(500).json({ success: false, error: 'Failed to get colis by livreur' });
  }
};

// Get colis by status
const getColisByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const result = await query('SELECT * FROM colis WHERE status = $1', [status]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get colis by status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get colis by status' });
  }
};

// Colis statistics (overview)
const getColisStats = async (req, res) => {
  try {
    const result = await query(
      `SELECT status, COUNT(*) as count FROM colis GROUP BY status`,
      []
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get colis stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get colis stats' });
  }
};

// Colis statistics by status
const getColisStatsByStatus = async (req, res) => {
  try {
    const result = await query(
      `SELECT status, COUNT(*) as count FROM colis GROUP BY status`,
      []
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get colis stats by status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get colis stats by status' });
  }
};

// Colis statistics by date
const getColisStatsByDate = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const result = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count FROM colis WHERE created_at BETWEEN $1 AND $2 GROUP BY date ORDER BY date ASC`,
      [date_from, date_to]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get colis stats by date error:', error);
    res.status(500).json({ success: false, error: 'Failed to get colis stats by date' });
  }
};

module.exports = {
  getAllColis,
  getColisById,
  createColis,
  updateColis,
  deleteColis,
  trackColis,
  getColisTracking,
  addTrackingEvent,
  assignColis,
  pickupColis,
  deliverColis,
  failColis,
  returnColis,
  getColisByExpediteur,
  getColisByLivreur,
  getColisByStatus,
  getColisStats,
  getColisStatsByStatus,
  getColisStatsByDate
}; 