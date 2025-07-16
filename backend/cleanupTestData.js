const db = require('./config/database');

const cleanupTestData = async () => {
  try {
    console.log('🧹 Cleaning up test data...');
    
    // Delete test admin from administrators table
    const adminResult = await db.query(`
      DELETE FROM administrators 
      WHERE email = 'testadmin@quickzone.tn'
      RETURNING id
    `);
    
    if (adminResult.rows.length > 0) {
      console.log('✅ Test admin deleted from administrators table');
    }
    
    // Delete test user from users table
    const userResult = await db.query(`
      DELETE FROM users 
      WHERE email = 'testadmin@quickzone.tn'
      RETURNING id
    `);
    
    if (userResult.rows.length > 0) {
      console.log('✅ Test user deleted from users table');
    }
    
    // Delete user roles
    const roleResult = await db.query(`
      DELETE FROM user_roles 
      WHERE user_id IN (SELECT id FROM users WHERE email = 'testadmin@quickzone.tn')
      RETURNING id
    `);
    
    if (roleResult.rows.length > 0) {
      console.log('✅ Test user roles deleted');
    }
    
    console.log('✅ Test data cleanup completed');
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  } finally {
    process.exit(0);
  }
};

cleanupTestData(); 