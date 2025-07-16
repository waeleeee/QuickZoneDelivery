const { Pool } = require('pg');
const dbConfig = require('../config/database.js');

const pool = new Pool(dbConfig);

async function checkDriversTable() {
  try {
    console.log('🔍 Checking drivers table schema...\n');

    // Get table columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'drivers' 
      ORDER BY ordinal_position
    `);

    console.log('📋 DRIVERS TABLE COLUMNS:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable}`);
    });

    // Get sample data
    const sampleResult = await pool.query('SELECT * FROM drivers LIMIT 1');
    
    if (sampleResult.rows.length > 0) {
      console.log('\n📋 SAMPLE DATA:');
      console.log('Sample record:', sampleResult.rows[0]);
    } else {
      console.log('\n📋 No data found in drivers table');
    }

  } catch (error) {
    console.error('❌ Error checking drivers table:', error);
  } finally {
    await pool.end();
  }
}

checkDriversTable(); 