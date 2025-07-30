const { pool } = require('./config/database');

async function clearFakeTrackingHistory() {
  try {
    console.log('🧹 CLEARING FAKE TRACKING HISTORY\n');
    console.log('=====================================');
    
    // Clear all existing tracking history
    console.log('🗑️ Clearing all existing tracking history...');
    const deleteResult = await pool.query('DELETE FROM parcel_tracking_history');
    console.log(`✅ Deleted ${deleteResult.rowCount} fake tracking history records`);
    
    // Create initial tracking records for existing parcels with real creation timestamps
    console.log('\n📦 Creating initial tracking records for existing parcels...');
    console.log('=====================================');
    
    const insertInitialRecordsQuery = `
      INSERT INTO parcel_tracking_history (parcel_id, status, previous_status, created_at)
      SELECT 
        id,
        status,
        NULL,
        created_at
      FROM parcels 
      WHERE id NOT IN (
        SELECT DISTINCT parcel_id FROM parcel_tracking_history
      )
    `;
    
    const insertResult = await pool.query(insertInitialRecordsQuery);
    console.log(`✅ Created ${insertResult.rowCount} initial tracking records with real timestamps`);
    
    // Show sample of cleaned tracking history
    console.log('\n📊 Sample of cleaned tracking history:');
    console.log('=====================================');
    
    const sampleQuery = `
      SELECT 
        pth.id,
        p.tracking_number,
        pth.status,
        pth.created_at,
        pth.location
      FROM parcel_tracking_history pth
      JOIN parcels p ON pth.parcel_id = p.id
      ORDER BY pth.created_at DESC
      LIMIT 10
    `;
    
    const sampleResult = await pool.query(sampleQuery);
    
    if (sampleResult.rows.length > 0) {
      console.log('ID'.padEnd(5) + 'Tracking'.padEnd(15) + 'Status'.padEnd(20) + 'Created'.padEnd(25) + 'Location');
      console.log('-'.repeat(80));
      
      sampleResult.rows.forEach(row => {
        console.log(
          row.id.toString().padEnd(5) + 
          (row.tracking_number || '').padEnd(15) + 
          (row.status || '').padEnd(20) + 
          new Date(row.created_at).toLocaleString('fr-FR').padEnd(25) + 
          (row.location || 'N/A')
        );
      });
    } else {
      console.log('No tracking history found.');
    }
    
    console.log('\n✅ FAKE TRACKING HISTORY CLEARED!');
    console.log('=====================================');
    console.log('• All fake tracking history deleted');
    console.log('• Initial records created with real timestamps');
    console.log('• System ready for real-time status tracking');
    console.log('• Future status changes will be properly recorded');
    
  } catch (error) {
    console.error('❌ Error clearing fake tracking history:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

// Run the cleanup
clearFakeTrackingHistory(); 