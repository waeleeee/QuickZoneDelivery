const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Get all shippers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    let query = `
      SELECT s.*
      FROM shippers s
      WHERE 1=1
    `;
    const queryParams = [];
    if (search) {
      query += ` AND (s.name ILIKE $1 OR s.email ILIKE $1 OR s.code ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }
    query += ` ORDER BY s.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    const result = await db.query(query, queryParams);
    // Get total count
    let countQuery = `SELECT COUNT(*) FROM shippers WHERE 1=1`;
    const countParams = [];
    if (search) {
      countQuery += ` AND (name ILIKE $1 OR email ILIKE $1 OR code ILIKE $1)`;
      countParams.push(`%${search}%`);
    }
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    res.json({
      success: true,
      data: {
        shippers: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get shippers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch shippers' });
  }
});

// Get shipper by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('SELECT * FROM shippers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shipper not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get shipper error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipper'
    });
  }
});

// Create new shipper (with file upload)
router.post('/', upload.fields([
  { name: 'id_document', maxCount: 1 },
  { name: 'company_documents', maxCount: 1 }
]), async (req, res) => {
  try {
    // Log the incoming data for debugging
    console.log('Create shipper request:', {
      body: req.body,
      bodyKeys: Object.keys(req.body),
      files: req.files
    });

    const {
      password, name, email, phone, agency, commercial_id,
      delivery_fees, return_fees, status, identity_number, company_name, fiscal_number,
      company_address, company_governorate, formType
    } = req.body;
    
    // Debug: Log specific required fields
    console.log('Required fields check:');
    console.log('name:', name, 'type:', typeof name);
    console.log('email:', email, 'type:', typeof email);
    console.log('password:', password, 'type:', typeof password);
    console.log('formType:', formType, 'type:', typeof formType);
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    // Validate form type specific fields
    if (formType === 'individual') {
      if (!identity_number) {
        return res.status(400).json({
          success: false,
          message: 'Numéro d\'identité is required for individual shippers'
        });
      }
    } else if (formType === 'company') {
      if (!company_name || !fiscal_number || !company_address || !company_governorate) {
        return res.status(400).json({
          success: false,
          message: 'Company name, fiscal number, address, and governorate are required for company shippers'
        });
      }
    }

    // Check if email already exists
    const existingEmail = await db.query('SELECT id FROM shippers WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'A shipper with this email already exists' 
      });
    }
    
    // Auto-generate code: EXP001, EXP002, etc.
    const codeResult = await db.query('SELECT MAX(CAST(SUBSTRING(code FROM 4) AS INTEGER)) as max_num FROM shippers WHERE code LIKE \'EXP%\'');
    const maxNum = codeResult.rows[0].max_num || 0;
    const nextNum = maxNum + 1;
    const code = `EXP${nextNum.toString().padStart(3, '0')}`;
    
    // Handle file uploads
    const id_document = req.files && req.files['id_document'] ? req.files['id_document'][0].filename : null;
    const company_documents = req.files && req.files['company_documents'] ? req.files['company_documents'][0].filename : null;
    
    // Prepare values with proper type conversion
    const values = [
      code,
      password,
      name,
      email,
      phone || null,
      agency || null,
      commercial_id ? parseInt(commercial_id) : null,
      delivery_fees ? parseFloat(delivery_fees) : 0,
      return_fees ? parseFloat(return_fees) : 0,
      status || 'Actif',
      identity_number || null,
      id_document,
      company_name || null,
      fiscal_number || null,
      company_address || null,
      company_governorate || null,
      company_documents,
      company_name || null // Also set the old company field for backward compatibility
    ];

    console.log('Insert values:', values);
    
    const result = await db.query(`
      INSERT INTO shippers (
        code, password, name, email, phone, agency, commercial_id,
        delivery_fees, return_fees, status, identity_number, id_document, company_name, fiscal_number,
        company_address, company_governorate, company_documents, company, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()
      ) RETURNING *
    `, values);

    console.log('Create successful:', result.rows[0]);

    res.status(201).json({ 
      success: true, 
      data: result.rows[0], 
      message: 'Shipper created successfully' 
    });
  } catch (error) {
    console.error('Create shipper error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    
    // Send more specific error messages
    let errorMessage = 'Failed to create shipper';
    if (error.code === '23505') { // Unique violation
      errorMessage = 'A shipper with this email or code already exists';
    } else if (error.code === '23503') { // Foreign key violation
      errorMessage = 'Invalid commercial or agency reference';
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

// Update shipper
router.put('/:id', upload.fields([
  { name: 'id_document', maxCount: 1 },
  { name: 'company_documents', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code, password, name, email, phone, agency, commercial_id,
      delivery_fees, return_fees, status, identity_number,
      company_name, fiscal_number, company_address, company_governorate,
      formType
    } = req.body;

    console.log('Update shipper request:', { 
      id, 
      body: req.body, 
      bodyKeys: Object.keys(req.body),
      files: req.files 
    });

    // Validate required fields based on form type
    if (formType === 'individual') {
      if (!identity_number) {
        return res.status(400).json({
          success: false,
          message: 'Numéro d\'identité is required for individual shippers'
        });
      }
    } else if (formType === 'company') {
      if (!company_name || !fiscal_number || !company_address || !company_governorate) {
        return res.status(400).json({
          success: false,
          message: 'Company name, fiscal number, address, and governorate are required for company shippers'
        });
      }
    }

    // Build dynamic update query - only update fields that are provided
    let updateFields = [];
    let updateValues = [];
    let paramIndex = 1;

    // Helper function to add field if value is provided
    const addField = (fieldName, value) => {
      if (value !== undefined && value !== null && value !== '') {
        updateFields.push(`${fieldName} = $${paramIndex}`);
        updateValues.push(value);
        paramIndex++;
      }
    };

    // Add fields that should be updated
    addField('code', code);
    addField('password', password);
    addField('name', name);
    addField('email', email);
    addField('phone', phone);
    addField('agency', agency);
    addField('commercial_id', commercial_id ? parseInt(commercial_id) : null);
    addField('delivery_fees', delivery_fees ? parseFloat(delivery_fees) : null);
    addField('return_fees', return_fees ? parseFloat(return_fees) : null);
    addField('status', status);
    
    // Add form type specific fields
    if (formType === 'individual') {
      addField('identity_number', identity_number);
      // Clear company fields for individual
      updateFields.push(`company_name = NULL, fiscal_number = NULL, company_address = NULL, company_governorate = NULL, company = NULL`);
    } else if (formType === 'company') {
      addField('company_name', company_name);
      addField('fiscal_number', fiscal_number);
      addField('company_address', company_address);
      addField('company_governorate', company_governorate);
      // Also update the old company field for backward compatibility
      addField('company', company_name);
      // Clear individual fields for company
      updateFields.push(`identity_number = NULL`);
    }

    // Add file fields if files were uploaded
    if (req.files && req.files.id_document) {
      updateFields.push(`id_document = $${paramIndex}`);
      updateValues.push(req.files.id_document[0].filename);
      paramIndex++;
    }
    if (req.files && req.files.company_documents) {
      updateFields.push(`company_documents = $${paramIndex}`);
      updateValues.push(req.files.company_documents[0].filename);
      paramIndex++;
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex}`);
    updateValues.push(new Date());
    paramIndex++;

    // Add the ID parameter
    updateValues.push(id);

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No fields to update. Please provide at least one field to modify.' 
      });
    }

    const setClause = updateFields.join(', ');
    const query = `UPDATE shippers SET ${setClause} WHERE id = $${paramIndex} RETURNING *`;

    console.log('Update query:', query);
    console.log('Update values:', updateValues);

    const result = await db.query(query, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Shipper not found' });
    }

    console.log('Update successful:', result.rows[0]);

    res.json({ 
      success: true, 
      data: result.rows[0], 
      message: 'Shipper updated successfully' 
    });

  } catch (error) {
    console.error('Update shipper error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    
    // Send more specific error messages
    let errorMessage = 'Failed to update shipper';
    if (error.code === '23505') { // Unique violation
      errorMessage = 'A shipper with this email or code already exists';
    } else if (error.code === '23503') { // Foreign key violation
      errorMessage = 'Invalid commercial or agency reference';
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

// Delete shipper
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, check if there are any payments associated with this shipper
    const paymentsCheck = await db.query('SELECT COUNT(*) as count FROM payments WHERE shipper_id = $1', [id]);
    const hasPayments = parseInt(paymentsCheck.rows[0].count) > 0;
    
    if (hasPayments) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete shipper because there are payments associated with them. Please delete the payments first or contact support.'
      });
    }
    
    // Check if there are any parcels associated with this shipper
    const parcelsCheck = await db.query('SELECT COUNT(*) as count FROM parcels WHERE shipper_id = $1', [id]);
    const hasParcels = parseInt(parcelsCheck.rows[0].count) > 0;
    
    if (hasParcels) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete shipper because there are parcels associated with them. Please delete the parcels first or contact support.'
      });
    }
    
    // If no dependencies, proceed with deletion
    const result = await db.query('DELETE FROM shippers WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shipper not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Shipper deleted successfully'
    });
  } catch (error) {
    console.error('Delete shipper error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to delete shipper';
    if (error.code === '23503') { // Foreign key violation
      errorMessage = 'Cannot delete shipper because there are related records (payments, parcels, etc.). Please delete related records first.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get shipper details with payments and parcels
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get shipper info
    const shipperResult = await db.query('SELECT * FROM shippers WHERE id = $1', [id]);
    
    if (shipperResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shipper not found'
      });
    }
    
    const shipper = shipperResult.rows[0];
    
    // Get payments for this shipper
    const paymentsResult = await db.query(`
      SELECT * FROM payments 
      WHERE shipper_id = $1 
      ORDER BY date DESC 
      LIMIT 10
    `, [id]);
    
    // Get parcels for this shipper
    const parcelsResult = await db.query(`
      SELECT 
        id,
        tracking_number,
        destination,
        status,
        weight,
        created_date,
        shipper_id
      FROM parcels 
      WHERE shipper_id = $1 
      ORDER BY created_date DESC 
      LIMIT 10
    `, [id]);
    
    // Calculate statistics
    const totalParcels = shipper.total_parcels || 0;
    const deliveredParcels = shipper.delivered_parcels || 0;
    const successRate = totalParcels > 0 ? (deliveredParcels / totalParcels) * 100 : 0;
    const totalRevenue = shipper.total_revenue || 0;
    
    res.json({
      success: true,
      data: {
        shipper,
        payments: paymentsResult.rows,
        parcels: parcelsResult.rows,
        statistics: {
          totalParcels,
          deliveredParcels,
          successRate: successRate.toFixed(1),
          totalRevenue: parseFloat(totalRevenue).toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Get shipper details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipper details'
    });
  }
});

module.exports = router; 