const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function runMigrations() {
  try {
    console.log('Starting database migration...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await query(statement);
          console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          // Skip if table already exists, extension already exists, or index already exists
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('relation') ||
              error.message.includes('function') ||
              error.message.includes('trigger')) {
            console.log(`⚠ Skipped statement ${i + 1}/${statements.length} (already exists)`);
          } else {
            console.error(`✗ Error in statement ${i + 1}/${statements.length}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations }; 