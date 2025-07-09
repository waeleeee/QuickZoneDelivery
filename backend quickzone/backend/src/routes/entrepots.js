const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateEntrepot } = require('../middleware/validation');

// Get all entrepots
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT e.*, COUNT(c.id) as colis_count
      FROM entrepots e
      LEFT JOIN colis c ON e.id = c.entrepot_id
      GROUP BY e.id
      ORDER BY e.nom
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get entrepot by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT e.*, COUNT(c.id) as colis_count
      FROM entrepots e
      LEFT JOIN colis c ON e.id = c.entrepot_id
      WHERE e.id = $1
      GROUP BY e.id
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrepot not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new entrepot
router.post('/', authenticateToken, validateEntrepot, async (req, res) => {
  try {
    const { nom, adresse, ville, code_postal, telephone, email, capacite } = req.body;
    
    const result = await query(`
      INSERT INTO entrepots (name, address, city, postal_code, phone, email, capacity)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [nom, adresse, ville, code_postal, telephone, email, capacite]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update entrepot
router.put('/:id', authenticateToken, validateEntrepot, async (req, res) => {
  try {
    const { nom, adresse, ville, code_postal, telephone, email, capacite } = req.body;
    const result = await query(`
      UPDATE entrepots 
      SET name = $1, address = $2, city = $3, postal_code = $4, 
          phone = $5, email = $6, capacity = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [nom, adresse, ville, code_postal, telephone, email, capacite, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrepot not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete entrepot
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if entrepot has colis
    const colisCheck = await query(`
      SELECT COUNT(*) FROM colis WHERE entrepot_id = $1
    `, [req.params.id]);
    
    if (parseInt(colisCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete entrepot with assigned colis' 
      });
    }
    
    const result = await query(`
      DELETE FROM entrepots WHERE id = $1 RETURNING *
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrepot not found' });
    }
    res.json({ message: 'Entrepot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get colis by entrepot
router.get('/:id/colis', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, e.nom as expediteur_nom, e.prenom as expediteur_prenom
      FROM colis c
      JOIN expediteurs e ON c.expediteur_id = e.id
      WHERE c.entrepot_id = $1
      ORDER BY c.created_at DESC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get entrepot statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_colis,
        COUNT(CASE WHEN status = 'en_transit' THEN 1 END) as en_transit,
        COUNT(CASE WHEN status = 'livre' THEN 1 END) as livre,
        COUNT(CASE WHEN status = 'retourne' THEN 1 END) as retourne,
        COUNT(CASE WHEN status = 'perdu' THEN 1 END) as perdu
      FROM colis 
      WHERE entrepot_id = $1
    `, [req.params.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 