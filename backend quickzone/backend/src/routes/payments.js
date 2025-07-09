const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validatePayment } = require('../middleware/validation');

// Get all payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, e.nom as expediteur_nom, e.prenom as expediteur_prenom
      FROM payments p
      JOIN expediteurs e ON p.expediteur_id = e.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, e.nom as expediteur_nom, e.prenom as expediteur_prenom
      FROM payments p
      JOIN expediteurs e ON p.expediteur_id = e.id
      WHERE p.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new payment
router.post('/', authenticateToken, validatePayment, async (req, res) => {
  try {
    const { expediteur_id, montant, methode_paiement, reference } = req.body;
    
    const result = await query(`
      INSERT INTO payments (expediteur_id, amount, payment_type, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *
    `, [expediteur_id, montant, methode_paiement]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payment status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await query(`
      UPDATE payments 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payments by expediteur
router.get('/expediteur/:expediteur_id', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM payments 
      WHERE expediteur_id = $1
      ORDER BY created_at DESC
    `, [req.params.expediteur_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 