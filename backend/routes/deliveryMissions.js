const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all delivery missions
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT dm.*, 
             d.first_name || ' ' || d.last_name as driver_name,
             w.name as warehouse_name,
             COUNT(mp.parcel_id) as assigned_parcels
      FROM delivery_missions dm
      LEFT JOIN users d ON dm.driver_id = d.id
      LEFT JOIN warehouses w ON dm.warehouse_id = w.id
      LEFT JOIN mission_parcels mp ON dm.id = mp.mission_id
      GROUP BY dm.id, d.first_name, d.last_name, w.name
      ORDER BY dm.created_at DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get delivery missions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery missions'
    });
  }
});

// Get available parcels for delivery mission
router.get('/available-parcels', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, s.name as client_name
      FROM parcels p
      JOIN shippers s ON p.shipper_id = s.id
      WHERE p.status = 'Au dépôt'
      ORDER BY p.created_at DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get available parcels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available parcels'
    });
  }
});

// Get delivery mission by ID with parcels
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get mission details
    const missionResult = await db.query(`
      SELECT dm.*, 
             d.first_name || ' ' || d.last_name as driver_name,
             w.name as warehouse_name
      FROM delivery_missions dm
      LEFT JOIN users d ON dm.driver_id = d.id
      LEFT JOIN warehouses w ON dm.warehouse_id = w.id
      WHERE dm.id = $1
    `, [id]);
    
    if (missionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Delivery mission not found'
      });
    }
    
    // Get assigned parcels
    const parcelsResult = await db.query(`
      SELECT p.*, mp.sequence_order, mp.status as mission_status
      FROM mission_parcels mp
      JOIN parcels p ON mp.parcel_id = p.id
      WHERE mp.mission_id = $1
      ORDER BY mp.sequence_order
    `, [id]);
    
    const mission = missionResult.rows[0];
    mission.parcels = parcelsResult.rows;
    
    res.json({
      success: true,
      data: mission
    });
  } catch (error) {
    console.error('Get delivery mission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery mission'
    });
  }
});

// Create new delivery mission
router.post('/', async (req, res) => {
  const client = await db.connect();
  try {
    const { 
      mission_number, 
      driver_id, 
      warehouse_id, 
      delivery_date, 
      parcel_ids,
      notes 
    } = req.body;
    
    await client.query('BEGIN');
    
    // Create delivery mission
    const missionResult = await client.query(`
      INSERT INTO delivery_missions (mission_number, driver_id, warehouse_id, delivery_date, estimated_parcels, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [mission_number, driver_id, warehouse_id, delivery_date, parcel_ids.length, notes, req.user?.id || 1]);
    
    const mission = missionResult.rows[0];
    
    // Assign parcels to mission
    for (let i = 0; i < parcel_ids.length; i++) {
      const parcel_id = parcel_ids[i];
      
      // Generate security codes for the parcel
      const client_code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const failed_code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Update parcel with security codes and status
      await client.query(`
        UPDATE parcels 
        SET status = 'en_cours',
            client_code = $1,
            failed_code = $2
        WHERE id = $3
      `, [client_code, failed_code, parcel_id]);
      
      // Add to mission_parcels
      await client.query(`
        INSERT INTO mission_parcels (mission_id, parcel_id, sequence_order)
        VALUES ($1, $2, $3)
      `, [mission.id, parcel_id, i + 1]);
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      data: mission,
      message: 'Delivery mission created successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create delivery mission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create delivery mission'
    });
  } finally {
    client.release();
  }
});

// Update delivery mission status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await db.query(`
      UPDATE delivery_missions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Delivery mission not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Delivery mission status updated successfully'
    });
  } catch (error) {
    console.error('Update delivery mission status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery mission status'
    });
  }
});

// Process delivery with security code
router.post('/:id/deliver', async (req, res) => {
  const client = await db.connect();
  try {
    const { id } = req.params;
    const { parcel_id, security_code } = req.body;
    
    await client.query('BEGIN');
    
    // Get parcel details
    const parcelResult = await client.query(`
      SELECT p.*, mp.mission_id
      FROM parcels p
      JOIN mission_parcels mp ON p.id = mp.parcel_id
      WHERE p.id = $1 AND mp.mission_id = $2
    `, [parcel_id, id]);
    
    if (parcelResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found in this mission'
      });
    }
    
    const parcel = parcelResult.rows[0];
    
    // Check security code
    if (security_code === parcel.client_code) {
      // Successful delivery
      await client.query(`
        UPDATE parcels 
        SET status = 'lives', 
            actual_delivery_date = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [parcel_id]);
      
      await client.query(`
        UPDATE mission_parcels 
        SET status = 'completed', 
            completed_at = CURRENT_TIMESTAMP
        WHERE mission_id = $1 AND parcel_id = $2
      `, [id, parcel_id]);
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        message: 'Parcel delivered successfully',
        status: 'lives'
      });
    } else if (security_code === parcel.failed_code) {
      // Failed delivery - return to depot
      await client.query(`
        UPDATE parcels 
        SET status = 'rtn_depot', 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [parcel_id]);
      
      await client.query(`
        UPDATE mission_parcels 
        SET status = 'failed', 
            completed_at = CURRENT_TIMESTAMP
        WHERE mission_id = $1 AND parcel_id = $2
      `, [id, parcel_id]);
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        message: 'Parcel returned to depot',
        status: 'rtn_depot'
      });
    } else {
      await client.query('ROLLBACK');
      res.status(400).json({
        success: false,
        message: 'Invalid security code'
      });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Process delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process delivery'
    });
  } finally {
    client.release();
  }
});

module.exports = router; 