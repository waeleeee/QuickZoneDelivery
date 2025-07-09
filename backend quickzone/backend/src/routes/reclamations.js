const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateReclamation } = require('../middleware/validation');

// Get all reclamations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT r.*, c.numero_colis, e.nom as expediteur_nom, e.prenom as expediteur_prenom
      FROM reclamations r
      JOIN colis c ON r.colis_id = c.id
      JOIN expediteurs e ON c.expediteur_id = e.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reclamation by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT r.*, c.numero_colis, e.nom as expediteur_nom, e.prenom as expediteur_prenom
      FROM reclamations r
      JOIN colis c ON r.colis_id = c.id
      JOIN expediteurs e ON c.expediteur_id = e.id
      WHERE r.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reclamation not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new reclamation
router.post('/', authenticateToken, validateReclamation, async (req, res) => {
  try {
    const { colis_id, type_reclamation, description, priorite } = req.body;
    
    const result = await query(`
      INSERT INTO reclamations (colis_id, subject, description, priority, status)
      VALUES ($1, $2, $3, $4, 'open')
      RETURNING *
    `, [colis_id, type_reclamation, description, priorite]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update reclamation status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const result = await query(`
      UPDATE reclamations 
      SET status = $1, resolution = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [status, resolution, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reclamation not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reclamations by expediteur
router.get('/expediteur/:expediteur_id', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT r.*, c.numero_colis
      FROM reclamations r
      JOIN colis c ON r.colis_id = c.id
      WHERE c.expediteur_id = $1
      ORDER BY r.created_at DESC
    `, [req.params.expediteur_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reclamations by status
router.get('/status/:status', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT r.*, c.numero_colis, e.nom as expediteur_nom, e.prenom as expediteur_prenom
      FROM reclamations r
      JOIN colis c ON r.colis_id = c.id
      JOIN expediteurs e ON c.expediteur_id = e.id
      WHERE r.status = $1
      ORDER BY r.created_at DESC
    `, [req.params.status]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 