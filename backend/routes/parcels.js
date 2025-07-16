const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Test endpoint - no authentication required
router.get('/test', (req, res) => {
  res.json({ message: 'Parcels API is working!' });
});

// Get all parcels
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', warehouse_id = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        p.*,
        s.name as shipper_name, 
        s.email as shipper_email,
        s.phone as shipper_phone,
        s.company as shipper_company,
        s.code as shipper_code
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE 1=1
    `;
    const queryParams = [];
    
    if (search) {
      query += ` AND (p.tracking_number ILIKE $${queryParams.length + 1} OR p.destination ILIKE $${queryParams.length + 1} OR s.name ILIKE $${queryParams.length + 1} OR s.code ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${search}%`);
    }
    
    if (status) {
      query += ` AND p.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }
    
    if (warehouse_id) {
      query += ` AND p.assigned_warehouse_id = $${queryParams.length + 1}`;
      queryParams.push(warehouse_id);
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    const result = await db.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE 1=1
    `;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (p.tracking_number ILIKE $${countParams.length + 1} OR p.destination ILIKE $${countParams.length + 1} OR s.name ILIKE $${countParams.length + 1} OR s.code ILIKE $${countParams.length + 1})`;
      countParams.push(`%${search}%`);
    }
    
    if (status) {
      countQuery += ` AND p.status = $${countParams.length + 1}`;
      countParams.push(status);
    }
    
    if (warehouse_id) {
      countQuery += ` AND p.assigned_warehouse_id = $${countParams.length + 1}`;
      countParams.push(warehouse_id);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get parcels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parcels'
    });
  }
});

// Get parcel by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT 
        p.*,
        s.name as shipper_name, 
        s.email as shipper_email,
        s.phone as shipper_phone,
        s.company as shipper_company,
        s.code as shipper_code
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get parcel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parcel'
    });
  }
});

// Create new parcel
router.post('/', async (req, res) => {
  try {
    const {
      tracking_number, shipper_id, destination, status, weight, price, type,
      estimated_delivery_date, delivery_fees, return_fees
    } = req.body;
    
    const result = await db.query(`
      INSERT INTO parcels (
        tracking_number, shipper_id, destination, status, weight, price, type,
        estimated_delivery_date, delivery_fees, return_fees
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [tracking_number, shipper_id, destination, status, weight, price, type, 
        estimated_delivery_date, delivery_fees, return_fees]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Parcel created successfully'
    });
  } catch (error) {
    console.error('Create parcel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create parcel'
    });
  }
});

// Update parcel
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tracking_number, shipper_id, destination, status, weight, price, type,
      estimated_delivery_date, delivery_fees, return_fees
    } = req.body;
    
    const result = await db.query(`
      UPDATE parcels 
      SET tracking_number = $1, shipper_id = $2, destination = $3, status = $4,
          weight = $5, price = $6, type = $7, estimated_delivery_date = $8,
          delivery_fees = $9, return_fees = $10, updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [tracking_number, shipper_id, destination, status, weight, price, type, 
        estimated_delivery_date, delivery_fees, return_fees, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Parcel updated successfully'
    });
  } catch (error) {
    console.error('Update parcel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update parcel'
    });
  }
});

// Delete parcel
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM parcels WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Parcel deleted successfully'
    });
  } catch (error) {
    console.error('Delete parcel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete parcel'
    });
  }
});

// Get expediteur dashboard statistics (MUST come before /expediteur/:email)
router.get('/expediteur/:email/stats', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Get total parcels count
    const totalParcelsResult = await db.query(`
      SELECT COUNT(*) as total
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE s.email = $1
    `, [email]);
    
    // Get parcels by status
    const statusStatsResult = await db.query(`
      SELECT 
        p.status,
        COUNT(*) as count
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE s.email = $1
      GROUP BY p.status
    `, [email]);
    
    // Get total revenue (sum of prices)
    const revenueResult = await db.query(`
      SELECT COALESCE(SUM(p.price), 0) as total_revenue
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE s.email = $1
    `, [email]);
    
    // Get parcels created this month
    const currentMonthResult = await db.query(`
      SELECT COUNT(*) as current_month
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE s.email = $1 
      AND p.created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `, [email]);
    
    // Get parcels delivered this month
    const deliveredThisMonthResult = await db.query(`
      SELECT COUNT(*) as delivered_this_month
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE s.email = $1 
      AND p.status IN ('delivered', 'delivered_paid')
      AND p.updated_at >= DATE_TRUNC('month', CURRENT_DATE)
    `, [email]);
    
    // Get complaints count (placeholder - you can add complaints table later)
    const complaintsCount = 0; // TODO: Add complaints table and query
    
    // Calculate monthly changes
    const lastMonthResult = await db.query(`
      SELECT COUNT(*) as last_month
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE s.email = $1 
      AND p.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      AND p.created_at < DATE_TRUNC('month', CURRENT_DATE)
    `, [email]);
    
    const lastMonthDeliveredResult = await db.query(`
      SELECT COUNT(*) as last_month_delivered
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE s.email = $1 
      AND p.status IN ('delivered', 'delivered_paid')
      AND p.updated_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      AND p.updated_at < DATE_TRUNC('month', CURRENT_DATE)
    `, [email]);
    
    // Calculate changes
    const currentMonth = parseInt(currentMonthResult.rows[0].current_month);
    const lastMonth = parseInt(lastMonthResult.rows[0].last_month);
    const deliveredThisMonth = parseInt(deliveredThisMonthResult.rows[0].delivered_this_month);
    const lastMonthDelivered = parseInt(lastMonthDeliveredResult.rows[0].last_month_delivered);
    
    const totalParcels = parseInt(totalParcelsResult.rows[0].total);
    const totalRevenue = parseFloat(revenueResult.rows[0].total_revenue);
    
    // Create status mapping
    const statusMap = {
      'pending': 'En attente',
      'to_pickup': 'À enlever',
      'picked_up': 'Enlevé',
      'at_warehouse': 'Au dépôt',
      'in_transit': 'En cours',
      'return_to_warehouse': 'RTN dépôt',
      'delivered': 'Livrés',
      'delivered_paid': 'Livrés payés',
      'definitive_return': 'Retour définitif',
      'return_to_client_agency': 'RTN client agence',
      'return_to_sender': 'Retour Expéditeur',
      'return_in_transit': 'Retour En Cours',
      'return_received': 'Retour reçu'
    };
    
    // Transform status stats
    const statusStats = {};
    statusStatsResult.rows.forEach(row => {
      const frenchStatus = statusMap[row.status] || row.status;
      statusStats[frenchStatus] = parseInt(row.count);
    });
    
    res.json({
      success: true,
      data: {
        totalParcels,
        totalRevenue,
        currentMonth,
        deliveredThisMonth,
        complaintsCount,
        monthlyChanges: {
          parcels: currentMonth - lastMonth,
          delivered: deliveredThisMonth - lastMonthDelivered
        },
        statusStats
      }
    });
  } catch (error) {
    console.error('Get expediteur stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expediteur statistics'
    });
  }
});

// Get parcels for a specific expéditeur (by email)
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
        s.company as shipper_company,
        s.code as shipper_code,
        s.city as shipper_city
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE s.email = $1
    `;
    const queryParams = [email];
    
    if (search) {
      query += ` AND (p.tracking_number ILIKE $2 OR p.destination ILIKE $2 OR s.name ILIKE $2 OR s.code ILIKE $2)`;
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
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE s.email = $1
    `;
    const countParams = [email];
    
    if (search) {
      countQuery += ` AND (p.tracking_number ILIKE $2 OR p.destination ILIKE $2 OR s.name ILIKE $2 OR s.code ILIKE $2)`;
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
        parcels: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get expediteur parcels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expediteur parcels'
    });
  }
});

module.exports = router; 