const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Helper: get full mission info with joins
async function getFullMission(row) {
  try {
    // Get driver info
    const driverRes = await db.query('SELECT id, first_name, last_name FROM users WHERE id = $1', [row.driver_id]);
    const driver = driverRes.rows[0] ? { 
      id: driverRes.rows[0].id, 
      name: `${driverRes.rows[0].first_name} ${driverRes.rows[0].last_name}` 
    } : null;
    
    // Get shipper info
    const shipperRes = await db.query('SELECT id, name FROM shippers WHERE id = $1', [row.shipper_id]);
    const shipper = shipperRes.rows[0] ? { 
      id: shipperRes.rows[0].id, 
      name: shipperRes.rows[0].name 
    } : null;
    
    // Get parcels for this mission
    const parcelsRes = await db.query(`
      SELECT p.id, p.destination, p.status 
      FROM parcels p 
      INNER JOIN mission_parcels mp ON p.id = mp.parcel_id 
      WHERE mp.mission_id = $1
    `, [row.id]);
    
    const parcels = parcelsRes.rows.map(p => ({
      id: p.id,
      destination: p.destination,
      status: p.status
    }));
    
    // Get creator info
    const creatorRes = await db.query('SELECT id, first_name, last_name, email FROM users WHERE id = $1', [row.created_by || 1]);
    const createdBy = creatorRes.rows[0] ? {
      id: creatorRes.rows[0].id,
      name: `${creatorRes.rows[0].first_name} ${creatorRes.rows[0].last_name}`,
      email: creatorRes.rows[0].email,
      role: 'Chef d\'agence'
    } : {
      id: 1,
      name: 'François Petit',
      email: 'francois.petit@quickzone.tn',
      role: 'Chef d\'agence'
    };
    
    return {
      id: row.id,
      mission_number: row.mission_number,
      driver,
      shipper,
      parcels,
      scheduled_time: row.scheduled_date,
      status: row.status,
      created_by: createdBy,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  } catch (error) {
    console.error('Error in getFullMission:', error);
    // Return basic mission data if joins fail
    return {
      id: row.id,
      mission_number: row.mission_number,
      driver: null,
      shipper: null,
      parcels: [],
      scheduled_time: row.scheduled_date,
      status: row.status,
      created_by: {
        id: 1,
        name: 'François Petit',
        email: 'francois.petit@quickzone.tn',
        role: 'Chef d\'agence'
      },
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

// GET all missions
router.get('/', async (req, res) => {
  try {
    console.log('GET /missions-pickup called');
    const result = await db.query('SELECT * FROM pickup_missions ORDER BY scheduled_date DESC');
    console.log('Query result:', result.rows.length, 'missions');
    
    const missions = await Promise.all(result.rows.map(getFullMission));
    res.json({ success: true, data: missions });
  } catch (err) {
    console.error('GET pickup_missions error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des missions' });
  }
});

// POST create mission
router.post('/', async (req, res) => {
  try {
    const { driver_id, shipper_id, colis_ids, scheduled_time, status } = req.body;
    
    // Generate mission number
    const missionNumber = `PIK${Date.now()}`;
    
    // Insert mission
    const insertQ = `INSERT INTO pickup_missions (mission_number, driver_id, shipper_id, scheduled_date, status, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [missionNumber, driver_id, shipper_id, scheduled_time, status || 'En attente', 1];
    const result = await db.query(insertQ, values);
    
    // Insert parcel assignments if colis_ids provided
    if (colis_ids && colis_ids.length > 0) {
      for (const parcelId of colis_ids) {
        await db.query('INSERT INTO mission_parcels (mission_id, parcel_id, status) VALUES ($1, $2, $3)', [result.rows[0].id, parcelId, 'pending']);
      }
    }
    
    const mission = await getFullMission(result.rows[0]);
    res.json({ success: true, data: mission });
  } catch (err) {
    console.error('POST pickup_missions error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la mission' });
  }
});

// PUT update mission
router.put('/:id', async (req, res) => {
  try {
    const { driver_id, shipper_id, colis_ids, scheduled_time, status } = req.body;
    const updateQ = `UPDATE pickup_missions SET driver_id=$1, shipper_id=$2, scheduled_date=$3, status=$4, updated_at=NOW() WHERE id=$5 RETURNING *`;
    const values = [driver_id, shipper_id, scheduled_time, status, req.params.id];
    const result = await db.query(updateQ, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Mission non trouvée' });
    }
    
    // Update parcel assignments if colis_ids provided
    if (colis_ids) {
      // Remove existing assignments
      await db.query('DELETE FROM mission_parcels WHERE mission_id = $1', [req.params.id]);
      // Add new assignments
      if (colis_ids.length > 0) {
        for (const parcelId of colis_ids) {
          await db.query('INSERT INTO mission_parcels (mission_id, parcel_id, status) VALUES ($1, $2, $3)', [req.params.id, parcelId, 'pending']);
        }
      }
    }
    
    const mission = await getFullMission(result.rows[0]);
    res.json({ success: true, data: mission });
  } catch (err) {
    console.error('PUT pickup_missions error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la modification de la mission' });
  }
});

// DELETE mission
router.delete('/:id', async (req, res) => {
  try {
    // First delete related mission_parcels
    await db.query('DELETE FROM mission_parcels WHERE mission_id = $1', [req.params.id]);
    
    // Then delete the mission
    const delQ = `DELETE FROM pickup_missions WHERE id=$1 RETURNING *`;
    const result = await db.query(delQ, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Mission non trouvée' });
    }
    
    res.json({ success: true, message: 'Mission supprimée' });
  } catch (err) {
    console.error('DELETE pickup_missions error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la mission' });
  }
});

module.exports = router; 