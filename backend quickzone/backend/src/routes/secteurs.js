const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateSecteur } = require('../middleware/validation');

// Get all secteurs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT s.*, COUNT(l.id) as livreur_count
      FROM secteurs s
      LEFT JOIN livreurs l ON s.id = l.secteur_id
      GROUP BY s.id
      ORDER BY s.nom
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get secteur by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT s.*, COUNT(l.id) as livreur_count
      FROM secteurs s
      LEFT JOIN livreurs l ON s.id = l.secteur_id
      WHERE s.id = $1
      GROUP BY s.id
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Secteur not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new secteur
router.post('/', authenticateToken, validateSecteur, async (req, res) => {
  try {
    const { nom, description, zone_geographique } = req.body;
    
    const result = await query(`
      INSERT INTO secteurs (name, description, city)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [nom, description, zone_geographique]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update secteur
router.put('/:id', authenticateToken, validateSecteur, async (req, res) => {
  try {
    const { nom, description, zone_geographique } = req.body;
    const result = await query(`
      UPDATE secteurs 
      SET name = $1, description = $2, city = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [nom, description, zone_geographique, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Secteur not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete secteur
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if secteur has livreurs
    const livreurCheck = await query(`
      SELECT COUNT(*) FROM livreurs WHERE secteur_id = $1
    `, [req.params.id]);
    
    if (parseInt(livreurCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete secteur with assigned livreurs' 
      });
    }
    
    const result = await query(`
      DELETE FROM secteurs WHERE id = $1 RETURNING *
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Secteur not found' });
    }
    res.json({ message: 'Secteur deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get livreurs by secteur
router.get('/:id/livreurs', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM livreurs 
      WHERE secteur_id = $1
      ORDER BY nom, prenom
    `, [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 