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
        s.company_name as shipper_company_name,
        s.code as shipper_code,
        s.fiscal_number as shipper_fiscal_number,
        s.tax_number as shipper_tax_number,
        s.company_governorate as shipper_company_governorate,
        s.company_address as shipper_company_address,
        s.city as shipper_city
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

// Get parcels for a specific expediteur by email
router.get('/expediteur/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 1000 } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('🔍 Fetching parcels for expediteur:', email);
    
    // First, find the expediteur by email
    const expediteurResult = await db.query(`
      SELECT id, name, email, phone, company_name, company, code
      FROM shippers 
      WHERE email = $1
    `, [email]);
    
    if (expediteurResult.rows.length === 0) {
      console.log('❌ No expediteur found for email:', email);
      return res.json({
        success: true,
        data: {
          expediteur: null,
          parcels: []
        }
      });
    }
    
    const expediteur = expediteurResult.rows[0];
    console.log('✅ Found expediteur:', expediteur);
    
    // Get parcels for this expediteur
    const parcelsQuery = `
      SELECT 
        p.*,
        s.name as shipper_name, 
        s.email as shipper_email,
        s.phone as shipper_phone,
        s.company as shipper_company,
        s.company_name as shipper_company_name,
        s.code as shipper_code,
        s.fiscal_number as shipper_fiscal_number,
        s.tax_number as shipper_tax_number,
        s.company_governorate as shipper_company_governorate,
        s.company_address as shipper_company_address,
        s.city as shipper_city
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE p.shipper_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const parcelsResult = await db.query(parcelsQuery, [expediteur.id, limit, offset]);
    
    console.log(`📦 Found ${parcelsResult.rows.length} parcels for expediteur ${email}`);
    
    res.json({
      success: true,
      data: {
        expediteur: expediteur,
        parcels: parcelsResult.rows
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

// Get parcels for a specific expediteur by email
router.get('/expediteur/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 1000 } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('🔍 Fetching parcels for expediteur:', email);
    
    // First, find the expediteur by email
    const expediteurResult = await db.query(`
      SELECT id, name, email, phone, company_name, company, code
      FROM shippers 
      WHERE email = $1
    `, [email]);
    
    if (expediteurResult.rows.length === 0) {
      console.log('❌ No expediteur found for email:', email);
      return res.json({
        success: true,
        data: {
          expediteur: null,
          parcels: []
        }
      });
    }
    
    const expediteur = expediteurResult.rows[0];
    console.log('✅ Found expediteur:', expediteur);
    
    // Get parcels for this expediteur
    const parcelsQuery = `
      SELECT 
        p.*,
        s.name as shipper_name, 
        s.email as shipper_email,
        s.phone as shipper_phone,
        s.company as shipper_company,
        s.company_name as shipper_company_name,
        s.code as shipper_code,
        s.fiscal_number as shipper_fiscal_number,
        s.tax_number as shipper_tax_number,
        s.company_governorate as shipper_company_governorate,
        s.company_address as shipper_company_address,
        s.city as shipper_city
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE p.shipper_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const parcelsResult = await db.query(parcelsQuery, [expediteur.id, limit, offset]);
    
    console.log(`📦 Found ${parcelsResult.rows.length} parcels for expediteur ${email}`);
    
    res.json({
      success: true,
      data: {
        expediteur: expediteur,
        parcels: parcelsResult.rows
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

// Get expediteur statistics
router.get('/expediteur/:email/stats', async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log('📊 Fetching stats for expediteur:', email);
    
    // First, find the expediteur by email
    const expediteurResult = await db.query(`
      SELECT id, name, email
      FROM shippers 
      WHERE email = $1
    `, [email]);
    
    if (expediteurResult.rows.length === 0) {
      console.log('❌ No expediteur found for email:', email);
      return res.json({
        success: true,
        data: {
          totalParcels: 0,
          totalRevenue: 0,
          currentMonth: 0,
          deliveredThisMonth: 0,
          complaintsCount: 0,
          monthlyChanges: { parcels: 0, delivered: 0 },
          statusStats: {}
        }
      });
    }
    
    const expediteur = expediteurResult.rows[0];
    
    // Get total parcels
    const totalParcelsResult = await db.query(`
      SELECT COUNT(*) as total
      FROM parcels 
      WHERE shipper_id = $1
    `, [expediteur.id]);
    
    // Get total revenue
    const totalRevenueResult = await db.query(`
      SELECT COALESCE(SUM(price), 0) as total
      FROM parcels 
      WHERE shipper_id = $1
    `, [expediteur.id]);
    
    // Get current month parcels
    const currentMonthResult = await db.query(`
      SELECT COUNT(*) as total
      FROM parcels 
      WHERE shipper_id = $1 
      AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `, [expediteur.id]);
    
    // Get delivered this month
    const deliveredThisMonthResult = await db.query(`
      SELECT COUNT(*) as total
      FROM parcels 
      WHERE shipper_id = $1 
      AND status IN ('lives', 'lives_payes')
      AND updated_at >= DATE_TRUNC('month', CURRENT_DATE)
    `, [expediteur.id]);
    
    // Get status statistics
    const statusStatsResult = await db.query(`
      SELECT status, COUNT(*) as count
      FROM parcels 
      WHERE shipper_id = $1
      GROUP BY status
    `, [expediteur.id]);
    
    const statusStats = {};
    statusStatsResult.rows.forEach(row => {
      statusStats[row.status] = parseInt(row.count);
    });
    
    const stats = {
      totalParcels: parseInt(totalParcelsResult.rows[0].total),
      totalRevenue: parseFloat(totalRevenueResult.rows[0].total),
      currentMonth: parseInt(currentMonthResult.rows[0].total),
      deliveredThisMonth: parseInt(deliveredThisMonthResult.rows[0].total),
      complaintsCount: 0, // TODO: Implement complaints
      monthlyChanges: { parcels: 0, delivered: 0 }, // TODO: Calculate changes
      statusStats: statusStats
    };
    
    console.log('📊 Stats for expediteur:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get expediteur stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expediteur stats'
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
        s.company_name as shipper_company_name,
        s.code as shipper_code,
        s.fiscal_number as shipper_fiscal_number,
        s.tax_number as shipper_tax_number,
        s.company_governorate as shipper_company_governorate,
        s.company_address as shipper_company_address,
        s.city as shipper_city
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
    console.log('📦 Creating parcel with data:', req.body);
    console.log('📦 Article name from request:', req.body.article_name);
    console.log('📝 Remark from request:', req.body.remark);
    
    const {
      tracking_number, shipper_id, destination, status, weight, price, type,
      estimated_delivery_date, delivery_fees, return_fees,
      recipient_name, recipient_phone, recipient_phone2, recipient_address, recipient_governorate,
      article_name, remark, nb_pieces
    } = req.body;
    
    // Generate a unique 6-digit client code for delivery verification
    const generateClientCode = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };
    
    const client_code = generateClientCode();
    
    console.log('📦 Article name after destructuring:', article_name);
    console.log('📝 Remark after destructuring:', remark);
    console.log('📦 nb_pieces after destructuring:', nb_pieces);
    console.log('📦 nb_pieces type:', typeof nb_pieces);
    
    const result = await db.query(`
      INSERT INTO parcels (
        tracking_number, shipper_id, destination, status, weight, price, type,
        estimated_delivery_date, delivery_fees, return_fees,
        recipient_name, recipient_phone, recipient_phone2, recipient_address, recipient_governorate,
        article_name, remark, nb_pieces, client_code
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [tracking_number, shipper_id, destination, status, weight, price, type, 
        estimated_delivery_date, delivery_fees, return_fees,
        recipient_name, recipient_phone, recipient_phone2, recipient_address, recipient_governorate,
        article_name, remark, nb_pieces, client_code]);
    
    console.log('✅ Parcel created:', result.rows[0]);
    console.log('🔐 Client code generated:', client_code);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Parcel created successfully',
      client_code: client_code
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
    console.log('📦 Updating parcel with ID:', id);
    console.log('📦 Update data:', req.body);
    
    const {
      tracking_number, shipper_id, destination, status, weight, price, type,
      estimated_delivery_date, delivery_fees, return_fees,
      recipient_name, recipient_phone, recipient_phone2, recipient_address, recipient_governorate,
      article_name, remark, nb_pieces,
      shipper_name, shipper_phone, shipper_email, shipper_company
    } = req.body;
    
    // First, update the parcel
    const result = await db.query(`
      UPDATE parcels 
      SET tracking_number = $1, shipper_id = $2, destination = $3, status = $4,
          weight = $5, price = $6, type = $7, estimated_delivery_date = $8,
          delivery_fees = $9, return_fees = $10, 
          recipient_name = $11, recipient_phone = $12, recipient_phone2 = $13, 
          recipient_address = $14, recipient_governorate = $15,
          article_name = $16, remark = $17, nb_pieces = $18,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $19
      RETURNING *
    `, [tracking_number, shipper_id, destination, status, weight, price, type, 
        estimated_delivery_date, delivery_fees, return_fees,
        recipient_name, recipient_phone, recipient_phone2, recipient_address, recipient_governorate,
        article_name, remark, nb_pieces, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }
    
    // If shipper information is provided, update the shipper as well
    if (shipper_name || shipper_phone || shipper_email || shipper_company) {
      try {
        console.log('📦 Updating shipper information for parcel:', id);
        
        // Get the shipper_id from the updated parcel
        const shipperId = result.rows[0].shipper_id;
        
        if (shipperId) {
          let shipperUpdateQuery = 'UPDATE shippers SET ';
          const shipperUpdateParams = [];
          let paramIndex = 1;
          
          if (shipper_name) {
            shipperUpdateQuery += `name = $${paramIndex}, `;
            shipperUpdateParams.push(shipper_name);
            paramIndex++;
          }
          if (shipper_phone) {
            shipperUpdateQuery += `phone = $${paramIndex}, `;
            shipperUpdateParams.push(shipper_phone);
            paramIndex++;
          }
          if (shipper_email) {
            shipperUpdateQuery += `email = $${paramIndex}, `;
            shipperUpdateParams.push(shipper_email);
            paramIndex++;
          }
          if (shipper_company) {
            shipperUpdateQuery += `company = $${paramIndex}, `;
            shipperUpdateParams.push(shipper_company);
            paramIndex++;
          }
          
          // Remove trailing comma and space
          shipperUpdateQuery = shipperUpdateQuery.slice(0, -2);
          shipperUpdateQuery += ` WHERE id = $${paramIndex}`;
          shipperUpdateParams.push(shipperId);
          
          await db.query(shipperUpdateQuery, shipperUpdateParams);
          console.log('✅ Shipper information updated successfully');
        }
      } catch (shipperError) {
        console.error('⚠️ Error updating shipper information:', shipperError);
        // Don't fail the entire update if shipper update fails
      }
    }
    
    // Get the updated parcel with shipper information
    const updatedParcelResult = await db.query(`
      SELECT 
        p.*,
        s.name as shipper_name, 
        s.email as shipper_email,
        s.phone as shipper_phone,
        s.company as shipper_company,
        s.company_name as shipper_company_name,
        s.code as shipper_code,
        s.fiscal_number as shipper_fiscal_number,
        s.tax_number as shipper_tax_number,
        s.company_governorate as shipper_company_governorate,
        s.company_address as shipper_company_address,
        s.city as shipper_city
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE p.id = $1
    `, [id]);
    
    res.json({
      success: true,
      data: updatedParcelResult.rows[0],
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
        s.company_name as shipper_company_name,
        s.code as shipper_code,
        s.fiscal_number as shipper_fiscal_number,
        s.tax_number as shipper_tax_number,
        s.company_governorate as shipper_company_governorate,
        s.company_address as shipper_company_address,
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
    
    // Map parcel statuses to French display names
    const statusMap = {
      'pending': 'En attente',
      'to_pickup': 'À enlever',
      'picked_up': 'Enlevé',
      'at_warehouse': 'Au dépôt',
      'au_depot': 'Au dépôt',
      'Au dépôt': 'Au dépôt',
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
    
    // Apply status mapping to parcels
    const parcelsWithMappedStatus = result.rows.map(parcel => ({
      ...parcel,
      status: statusMap[parcel.status] || parcel.status
    }));
    
    res.json({
      success: true,
      data: {
        parcels: parcelsWithMappedStatus,
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

// GET parcel tracking history
router.get('/:id/tracking-history', async (req, res) => {
  try {
    console.log('📊 GET /parcels/:id/tracking-history called');
    
    const parcelId = req.params.id;
    
    // Get parcel details
    const parcelQuery = `
      SELECT 
        p.id,
        p.tracking_number,
        p.status as current_status,
        p.created_at,
        p.updated_at,
        s.name as shipper_name,
        s.company_address as shipper_address,
        s.city as shipper_city
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      WHERE p.id = $1
    `;
    
    const parcelResult = await db.query(parcelQuery, [parcelId]);
    
    if (parcelResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Colis non trouvé' });
    }
    
    const parcel = parcelResult.rows[0];
    
    // Get tracking history
    const historyQuery = `
      SELECT 
        pth.id,
        pth.status,
        pth.previous_status,
        pth.mission_id,
        pth.updated_by,
        pth.location,
        pth.notes,
        pth.created_at,
        pm.mission_number
      FROM parcel_tracking_history pth
      LEFT JOIN pickup_missions pm ON pth.mission_id = pm.id
      WHERE pth.parcel_id = $1
      ORDER BY pth.created_at ASC
    `;
    
    const historyResult = await db.query(historyQuery, [parcelId]);
    
    // Format the response
    const trackingHistory = historyResult.rows.map(row => ({
      id: row.id,
      status: row.status,
      previous_status: row.previous_status,
      mission_id: row.mission_id,
      mission_number: row.mission_number,
      updated_by: 'Système',
      location: row.location,
      notes: row.notes,
      timestamp: row.created_at
    }));
    
    const response = {
      success: true,
      data: {
        parcel: {
          id: parcel.id,
          tracking_number: parcel.tracking_number,
          current_status: parcel.current_status,
          created_at: parcel.created_at,
          updated_at: parcel.updated_at,
          shipper_name: parcel.shipper_name,
          shipper_address: parcel.shipper_address,
          shipper_city: parcel.shipper_city
        },
        tracking_history: trackingHistory
      }
    };
    
    console.log(`✅ Tracking history retrieved for parcel ${parcelId}: ${trackingHistory.length} records`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error getting parcel tracking history:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'historique' });
  }
});

// Delete parcel
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if the parcel exists
    const checkResult = await db.query('SELECT id, tracking_number FROM parcels WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }
    
    const parcel = checkResult.rows[0];
    
    // Start transaction for deletion
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete related records first (in order of dependencies)
      
      // 1. Delete mission_parcels (referenced by parcel_id)
      const missionParcelsResult = await client.query('DELETE FROM mission_parcels WHERE parcel_id = $1 RETURNING id', [id]);
      const deletedMissionParcels = missionParcelsResult.rows.length;
      
      // 2. Delete parcel_timeline (referenced by parcel_id)
      const parcelTimelineResult = await client.query('DELETE FROM parcel_timeline WHERE parcel_id = $1 RETURNING id', [id]);
      const deletedParcelTimeline = parcelTimelineResult.rows.length;
      
      // 3. Delete the parcel
      const deleteResult = await client.query('DELETE FROM parcels WHERE id = $1 RETURNING id', [id]);
      
      if (deleteResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Parcel not found'
        });
      }
      
      await client.query('COMMIT');
      
      console.log(`✅ Parcel deleted successfully: ${parcel.tracking_number}`);
      
      res.json({
        success: true,
        message: 'Parcel deleted successfully',
        deletedMissionParcels,
        deletedParcelTimeline
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete parcel error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    
    // Send more specific error messages
    let errorMessage = 'Failed to delete parcel';
    if (error.code === '23503') { // Foreign key violation
      errorMessage = 'Cannot delete parcel because there are related records that could not be removed.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 