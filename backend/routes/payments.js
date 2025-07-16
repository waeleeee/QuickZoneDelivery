const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all payments
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, s.name as shipper_name
      FROM payments p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      ORDER BY p.created_at DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
});

// Get payments for a specific shipper (by ID)
router.get('/shipper/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT p.*, s.name as shipper_name
      FROM payments p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE p.shipper_id = $1
      ORDER BY p.created_at DESC
    `, [id]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get shipper payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipper payments'
    });
  }
});

// Get payments for a specific expéditeur (by email)
router.get('/expediteur/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 1000, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        p.*,
        s.name as shipper_name,
        s.email as shipper_email,
        s.phone as shipper_phone,
        s.company as shipper_company
      FROM payments p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE s.email = $1
    `;
    const queryParams = [email];
    
    if (search) {
      query += ` AND (p.reference ILIKE $2 OR p.payment_method ILIKE $2 OR s.name ILIKE $2)`;
      queryParams.push(`%${search}%`);
    }
    
    if (status) {
      query += ` AND p.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    const result = await db.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM payments p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE s.email = $1
    `;
    const countParams = [email];
    
    if (search) {
      countQuery += ` AND (p.reference ILIKE $2 OR p.payment_method ILIKE $2 OR s.name ILIKE $2)`;
      countParams.push(`%${search}%`);
    }
    
    if (status) {
      countQuery += ` AND p.status = $${countParams.length + 1}`;
      countParams.push(status);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      data: {
        payments: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get expediteur payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expediteur payments'
    });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if payment exists
    const paymentCheck = await db.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (paymentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Delete the payment
    const result = await db.query('DELETE FROM payments WHERE id = $1 RETURNING *', [id]);
    
    res.json({
      success: true,
      message: 'Payment deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment'
    });
  }
});

module.exports = router; 