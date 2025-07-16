const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all users for dropdowns
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = `
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, r.name as role, u.is_active
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.is_active = true
    `;
    
    const queryParams = [];
    
    if (role) {
      query += ` AND r.name = $1`;
      queryParams.push(role);
    }
    
    query += ` ORDER BY u.first_name, u.last_name`;
    
    const result = await db.query(query, queryParams);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Agency Managers Management - MUST BE BEFORE GENERIC ROUTES
// Get agency managers
router.get('/agency-managers', async (req, res) => {
  console.log('🚀 Agency managers route hit!');
  try {
    console.log('🔍 Agency managers endpoint called');
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('Query params:', { page, limit, search, offset });
    
    let query = `
      SELECT id, name, email, phone, governorate, address, agency, created_at
      FROM agency_managers
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (search) {
      query += ` AND (name ILIKE $1 OR email ILIKE $1 OR agency ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    console.log('Final query:', query);
    console.log('Query params:', queryParams);
    
    const result = await db.query(query, queryParams);
    console.log('Query result rows:', result.rows.length);
    console.log('First row:', result.rows[0]);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) FROM agency_managers WHERE 1=1`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (name ILIKE $1 OR email ILIKE $1 OR agency ILIKE $1)`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    console.log('Total count:', total);
    
    const response = {
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Get agency managers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency managers'
    });
  }
});

// Allowed agencies
const ALLOWED_AGENCIES = ['Siège', 'Tunis', 'Sousse', 'Sfax'];

// Create new agency manager
router.post('/agency-managers', async (req, res) => {
  try {
    const { name, email, phone, governorate, address, agency } = req.body;

    // Restrict agencies
    if (!ALLOWED_AGENCIES.includes(agency)) {
      return res.status(400).json({
        success: false,
        message: "L'agence doit être l'une de : Siège, Tunis, Sousse, Sfax."
      });
    }

    // Only one chef per agency
    const existing = await db.query('SELECT id FROM agency_managers WHERE agency = $1', [agency]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cette agence a déjà un chef d'agence."
      });
    }

    // Check if agency manager already exists by email
    const existingManager = await db.query(
      'SELECT id FROM agency_managers WHERE email = $1',
      [email]
    );
    if (existingManager.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Agency manager with this email already exists'
      });
    }

    // Create new agency manager
    const result = await db.query(`
      INSERT INTO agency_managers (name, email, phone, governorate, address, agency)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, phone, governorate, address, agency, created_at
    `, [name, email, phone, governorate, address, agency]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Agency manager created successfully'
    });
  } catch (error) {
    console.error('Create agency manager error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create agency manager'
    });
  }
});

// Update agency manager
router.put('/agency-managers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, governorate, address, agency } = req.body;

    // Restrict agencies
    if (!ALLOWED_AGENCIES.includes(agency)) {
      return res.status(400).json({
        success: false,
        message: "L'agence doit être l'une de : Siège, Tunis, Sousse, Sfax."
      });
    }

    // Only one chef per agency (except for current)
    const existing = await db.query('SELECT id FROM agency_managers WHERE agency = $1 AND id != $2', [agency, id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cette agence a déjà un chef d'agence."
      });
    }

    const result = await db.query(`
      UPDATE agency_managers 
      SET name = $1, email = $2, phone = $3, governorate = $4, address = $5, agency = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, name, email, phone, governorate, address, agency, updated_at
    `, [name, email, phone, governorate, address, agency, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agency manager not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Agency manager updated successfully'
    });
  } catch (error) {
    console.error('Update agency manager error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update agency manager'
    });
  }
});

// Delete agency manager
router.delete('/agency-managers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if referenced in sectors
    const referenced = await db.query('SELECT id FROM sectors WHERE manager_id = $1', [id]);
    if (referenced.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Impossible de supprimer ce chef d'agence car il est responsable d'un secteur."
      });
    }

    const result = await db.query(`
      DELETE FROM agency_managers 
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agency manager not found'
      });
    }

    res.json({
      success: true,
      message: 'Agency manager deleted successfully'
    });
  } catch (error) {
    console.error('Delete agency manager error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete agency manager'
    });
  }
});

// Agency Members Management - MUST BE BEFORE GENERIC ROUTES
// Get agency members
router.get('/agency-members', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, name, email, phone, governorate, address, agency, role, status, created_at
      FROM agency_members
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (search) {
      query += ` AND (name ILIKE $1 OR email ILIKE $1 OR agency ILIKE $1 OR role ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    const result = await db.query(query, queryParams);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) FROM agency_members WHERE 1=1`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (name ILIKE $1 OR email ILIKE $1 OR agency ILIKE $1 OR role ILIKE $1)`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get agency members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency members'
    });
  }
});

// Allowed roles for agency members
const ALLOWED_ROLES = [
  'Magasinier',
  'Agent Débriefing Livreurs',
  'Magasinier de Nuit',
  'Chargé des Opérations Logistiques',
  'Sinior OPS Membre'
];

// Create new agency member
router.post('/agency-members', async (req, res) => {
  try {
    const { name, email, phone, governorate, address, agency, role } = req.body;

    // Role validation
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Le rôle '${role}' n'est pas autorisé. Rôles valides: ${ALLOWED_ROLES.join(', ')}`
      });
    }
    
    // Check if agency member already exists
    const existingMember = await db.query(
      'SELECT id FROM agency_members WHERE email = $1',
      [email]
    );
    
    if (existingMember.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Agency member with this email already exists'
      });
    }
    
    // Create new agency member
    const result = await db.query(`
      INSERT INTO agency_members (name, email, phone, governorate, address, agency, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Actif')
      RETURNING id, name, email, phone, governorate, address, agency, role, status, created_at
    `, [name, email, phone, governorate, address, agency, role]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Agency member created successfully'
    });
  } catch (error) {
    console.error('Create agency member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create agency member'
    });
  }
});

// Update agency member
router.put('/agency-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, governorate, address, agency, role, status } = req.body;

    // Role validation
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Le rôle '${role}' n'est pas autorisé. Rôles valides: ${ALLOWED_ROLES.join(', ')}`
      });
    }
    
    const result = await db.query(`
      UPDATE agency_members 
      SET name = $1, email = $2, phone = $3, governorate = $4, address = $5, agency = $6, role = $7, status = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING id, name, email, phone, governorate, address, agency, role, status, updated_at
    `, [name, email, phone, governorate, address, agency, role, status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agency member not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Agency member updated successfully'
    });
  } catch (error) {
    console.error('Update agency member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update agency member'
    });
  }
});

// Delete agency member
router.delete('/agency-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      DELETE FROM agency_members 
      WHERE id = $1
      RETURNING id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agency member not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Agency member deleted successfully'
    });
  } catch (error) {
    console.error('Delete agency member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete agency member'
    });
  }
});

// Get administrators specifically
router.get('/administrators', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, name, email, phone, governorate, address, role, created_at
      FROM administrators
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (search) {
      query += ` AND (name ILIKE $1 OR email ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    const result = await db.query(query, queryParams);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) FROM administrators WHERE 1=1`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (name ILIKE $1 OR email ILIKE $1)`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get administrators error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch administrators'
    });
  }
});

// Create new administrator
router.post('/administrators', async (req, res) => {
  try {
    const { name, email, password, phone, governorate, address, role } = req.body;
    
    // Check if administrator already exists
    const existingAdmin = await db.query(
      'SELECT id FROM administrators WHERE email = $1',
      [email]
    );
    
    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Administrator with this email already exists'
      });
    }
    
    // Check if user already exists in users table
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Hash password if provided
    let hashedPassword = null;
    if (password && password.trim() !== '') {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }
    
    // Start transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create user in users table
      const userResult = await client.query(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [email, email, hashedPassword, name, '', phone, true, true]);
      
      const userId = userResult.rows[0].id;
      
      // Get role ID for Administration
      const roleResult = await client.query('SELECT id FROM roles WHERE name = $1', ['Administration']);
      if (roleResult.rows.length === 0) {
        throw new Error('Administration role not found');
      }
      
      const roleId = roleResult.rows[0].id;
      
      // Assign role to user
      await client.query(`
        INSERT INTO user_roles (user_id, role_id, assigned_by, is_active)
        VALUES ($1, $2, $3, $4)
      `, [userId, roleId, userId, true]);
      
      // Create administrator record
      const adminResult = await client.query(`
        INSERT INTO administrators (name, email, password, phone, governorate, address, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, phone, governorate, address, role, created_at
      `, [name, email, hashedPassword, phone, governorate, address, role]);
      
      await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
        data: adminResult.rows[0],
      message: 'Administrator created successfully'
    });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Create administrator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create administrator'
    });
  }
});

// Update administrator
router.put('/administrators/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone, governorate, address, role } = req.body;
    
    // Hash password if provided
    let hashedPassword = null;
    if (password && password.trim() !== '') {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    
    // Start transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Build update query for administrators table
      let adminQuery, adminParams;
      if (hashedPassword) {
        adminQuery = `
          UPDATE administrators 
          SET name = $1, email = $2, password = $3, phone = $4, governorate = $5, address = $6, role = $7, updated_at = CURRENT_TIMESTAMP
          WHERE id = $8
          RETURNING id, name, email, phone, governorate, address, role, updated_at
        `;
        adminParams = [name, email, hashedPassword, phone, governorate, address, role, id];
      } else {
        adminQuery = `
      UPDATE administrators 
      SET name = $1, email = $2, phone = $3, governorate = $4, address = $5, role = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, name, email, phone, governorate, address, role, updated_at
        `;
        adminParams = [name, email, phone, governorate, address, role, id];
      }
    
      const adminResult = await client.query(adminQuery, adminParams);
      
      if (adminResult.rows.length === 0) {
        await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Administrator not found'
      });
    }
      
      // If password was changed, also update the users table
      if (hashedPassword) {
        await client.query(`
          UPDATE users 
          SET first_name = $1, email = $2, password_hash = $3, phone = $4, updated_at = CURRENT_TIMESTAMP
          WHERE email = $5
        `, [name, email, hashedPassword, phone, email]);
      } else {
        // Update other fields in users table
        await client.query(`
          UPDATE users 
          SET first_name = $1, email = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
          WHERE email = $4
        `, [name, email, phone, email]);
      }
      
      await client.query('COMMIT');
    
    res.json({
      success: true,
        data: adminResult.rows[0],
      message: 'Administrator updated successfully'
    });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Update administrator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update administrator'
    });
  }
});

// Delete administrator
router.delete('/administrators/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      DELETE FROM administrators 
      WHERE id = $1
      RETURNING id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Administrator not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Administrator deleted successfully'
    });
  } catch (error) {
    console.error('Delete administrator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete administrator'
    });
  }
});

// Get commercials specifically
router.get('/commercials', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, name, email, phone, governorate, address, title, clients_count, shipments_received, created_at
      FROM commercials
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (search) {
      query += ` AND (name ILIKE $1 OR email ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    const result = await db.query(query, queryParams);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get commercials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commercials'
    });
  }
});

// Create new commercial
router.post('/commercials', async (req, res) => {
  try {
    const { name, email, phone, governorate, address, title } = req.body;
    
    // Check if commercial already exists
    const existingCommercial = await db.query(
      'SELECT id FROM commercials WHERE email = $1',
      [email]
    );
    
    if (existingCommercial.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Commercial with this email already exists'
      });
    }
    
    // Create new commercial
    const result = await db.query(`
      INSERT INTO commercials (name, email, phone, governorate, address, title)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, phone, governorate, address, title, created_at
    `, [name, email, phone, governorate, address, title]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Commercial created successfully'
    });
  } catch (error) {
    console.error('Create commercial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create commercial'
    });
  }
});

// Update commercial
router.put('/commercials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, governorate, address, title } = req.body;
    
    const result = await db.query(`
      UPDATE commercials 
      SET name = $1, email = $2, phone = $3, governorate = $4, address = $5, title = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, name, email, phone, governorate, address, title, updated_at
    `, [name, email, phone, governorate, address, title, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commercial not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Commercial updated successfully'
    });
  } catch (error) {
    console.error('Update commercial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update commercial'
    });
  }
});

// Delete commercial
router.delete('/commercials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      DELETE FROM commercials 
      WHERE id = $1
      RETURNING id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commercial not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Commercial deleted successfully'
    });
  } catch (error) {
    console.error('Delete commercial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete commercial'
    });
  }
});

// Get shippers by commercial ID
router.get('/commercials/:id/shippers', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT id, code, name, email, phone, company, total_parcels, delivered_parcels, returned_parcels, 
             delivery_fees, return_fees, status, siret, fiscal_number, agency, created_at
      FROM shippers 
      WHERE commercial_id = $1
      ORDER BY created_at DESC
    `, [id]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get shippers by commercial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shippers for this commercial'
    });
  }
});

// Get accountants specifically
router.get('/accountants', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, name, email, phone, governorate, address, title, agency, created_at
      FROM accountants
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (search) {
      query += ` AND (name ILIKE $1 OR email ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    const result = await db.query(query, queryParams);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) FROM accountants WHERE 1=1`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (name ILIKE $1 OR email ILIKE $1)`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get accountants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accountants'
    });
  }
});

// Create new accountant
router.post('/accountants', async (req, res) => {
  try {
    const { name, email, phone, governorate, address, title, agency } = req.body;
    
    // Check if accountant already exists
    const existingAccountant = await db.query(
      'SELECT id FROM accountants WHERE email = $1',
      [email]
    );
    
    if (existingAccountant.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Accountant with this email already exists'
      });
    }
    
    // Create new accountant
    const result = await db.query(`
      INSERT INTO accountants (name, email, phone, governorate, address, title, agency)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, phone, governorate, address, title, agency, created_at
    `, [name, email, phone, governorate, address, title, agency]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Accountant created successfully'
    });
  } catch (error) {
    console.error('Create accountant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create accountant'
    });
  }
});

// Update accountant
router.put('/accountants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, governorate, address, title, agency } = req.body;
    
    const result = await db.query(`
      UPDATE accountants 
      SET name = $1, email = $2, phone = $3, governorate = $4, address = $5, title = $6, agency = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING id, name, email, phone, governorate, address, title, agency, updated_at
    `, [name, email, phone, governorate, address, title, agency, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Accountant not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Accountant updated successfully'
    });
  } catch (error) {
    console.error('Update accountant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update accountant'
    });
  }
});

// Delete accountant
router.delete('/accountants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      DELETE FROM accountants 
      WHERE id = $1
      RETURNING id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Accountant not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Accountant deleted successfully'
    });
  } catch (error) {
    console.error('Delete accountant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete accountant'
    });
  }
});

// Get drivers specifically
router.get('/livreurs', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, name, email, phone, governorate, address, vehicle, status, 
             cin_number, driving_license, car_number, car_type, insurance_number, agency,
             photo_url, personal_documents_url, car_documents_url, created_at
      FROM drivers
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (search) {
      query += ` AND (name ILIKE $1 OR email ILIKE $1 OR car_number ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    const result = await db.query(query, queryParams);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drivers'
    });
  }
});

// Create new driver
router.post('/livreurs', async (req, res) => {
  try {
    const { 
      name, email, phone, governorate, address, vehicle, status,
      cin_number, driving_license, car_number, car_type, insurance_number, agency,
      photo_url, personal_documents_url, car_documents_url
    } = req.body;

    // Check if driver already exists by email
    const existingDriver = await db.query(
      'SELECT id FROM drivers WHERE email = $1',
      [email]
    );
    
    if (existingDriver.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un livreur avec cet email existe déjà'
      });
    }

    // Create new driver
    const result = await db.query(`
      INSERT INTO drivers (
        name, email, phone, governorate, address, vehicle, status,
        cin_number, driving_license, car_number, car_type, insurance_number, agency,
        photo_url, personal_documents_url, car_documents_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id, name, email, phone, governorate, address, vehicle, status,
                cin_number, driving_license, car_number, car_type, insurance_number, agency,
                photo_url, personal_documents_url, car_documents_url, created_at
    `, [
      name, email, phone, governorate, address, vehicle, status || 'Disponible',
      cin_number, driving_license, car_number, car_type, insurance_number, agency,
      photo_url, personal_documents_url, car_documents_url
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Livreur créé avec succès'
    });
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du livreur'
    });
  }
});

// Update driver
router.put('/livreurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, email, phone, governorate, address, vehicle, status,
      cin_number, driving_license, car_number, car_type, insurance_number, agency,
      photo_url, personal_documents_url, car_documents_url
    } = req.body;

    // Log the request body for debugging
    console.log('Update driver request body:', req.body);
    console.log('Driver ID:', id);

    // First check if the driver exists
    const checkResult = await db.query('SELECT id FROM drivers WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Livreur non trouvé'
      });
    }

    const result = await db.query(`
      UPDATE drivers 
      SET name = $1, email = $2, phone = $3, governorate = $4, address = $5, 
          vehicle = $6, status = $7, cin_number = $8, driving_license = $9,
          car_number = $10, car_type = $11, insurance_number = $12, agency = $13,
          photo_url = $14, personal_documents_url = $15, car_documents_url = $16,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $17
      RETURNING id, name, email, phone, governorate, address, vehicle, status,
                cin_number, driving_license, car_number, car_type, insurance_number, agency,
                photo_url, personal_documents_url, car_documents_url, updated_at
    `, [
      name || null, email || null, phone || null, governorate || null, address || null, 
      vehicle || null, status || null, cin_number || null, driving_license || null,
      car_number || null, car_type || null, insurance_number || null, agency || null,
      photo_url || null, personal_documents_url || null, car_documents_url || null, id
    ]);

    console.log('Update result:', result.rows[0]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Livreur mis à jour avec succès'
    });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du livreur: ' + error.message
    });
  }
});

// Delete driver
router.delete('/livreurs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if referenced in pickup missions
    const referenced = await db.query('SELECT id FROM pickup_missions WHERE driver_id = $1', [id]);
    if (referenced.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce livreur car il est assigné à des missions de ramassage'
      });
    }

    // Check if referenced in shippers
    const shipperRef = await db.query('SELECT id FROM shippers WHERE default_driver_id = $1', [id]);
    if (shipperRef.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce livreur car il est le livreur par défaut d\'un expéditeur'
      });
    }

    const result = await db.query(`
      DELETE FROM drivers 
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Livreur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Livreur supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du livreur'
    });
  }
});

// Get all personnel by type
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.is_active, u.created_at
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name = $1
    `;
    
    const queryParams = [type];
    
    if (search) {
      query += ` AND (u.username ILIKE $2 OR u.email ILIKE $2 OR u.first_name ILIKE $2 OR u.last_name ILIKE $2)`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY u.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    const result = await db.query(query, queryParams);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*)
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name = $1
    `;
    const countParams = [type];
    
    if (search) {
      countQuery += ` AND (u.username ILIKE $2 OR u.email ILIKE $2 OR u.first_name ILIKE $2 OR u.last_name ILIKE $2)`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get personnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personnel data'
    });
  }
});

// Create new personnel
router.post('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { username, email, password, first_name, last_name } = req.body;
    
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const result = await db.query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, username, email, first_name, last_name, is_active, created_at
    `, [username, email, passwordHash, first_name, last_name]);
    
    // Get role ID for the type
    const roleResult = await db.query('SELECT id FROM roles WHERE name = $1', [type]);
    if (roleResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role type'
      });
    }
    
    // Assign role to user
    await db.query(`
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2)
    `, [result.rows[0].id, roleResult.rows[0].id]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: `${type} created successfully`
    });
  } catch (error) {
    console.error('Create personnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create personnel'
    });
  }
});

// Update personnel
router.put('/:type/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, first_name, last_name, is_active } = req.body;
    
    const result = await db.query(`
      UPDATE users 
      SET username = $1, email = $2, first_name = $3, last_name = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, username, email, first_name, last_name, is_active, updated_at
    `, [username, email, first_name, last_name, is_active, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Personnel updated successfully'
    });
  } catch (error) {
    console.error('Update personnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update personnel'
    });
  }
});

// Delete personnel
router.delete('/:type/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      DELETE FROM users 
      WHERE id = $1
      RETURNING id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Personnel deleted successfully'
    });
  } catch (error) {
    console.error('Delete personnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete personnel'
    });
  }
});

module.exports = router; 