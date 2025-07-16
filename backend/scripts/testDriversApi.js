const db = require('../config/database');

const testDriversApi = async () => {
  try {
    console.log('🧪 Testing drivers API...\n');

    // Test the exact query that the API uses
    const query = `
      SELECT id, name, email, phone, governorate, address, vehicle, status, 
             cin_number, driving_license, car_number, car_type, insurance_number, agency,
             photo_url, personal_documents_url, car_documents_url, created_at
      FROM drivers
      ORDER BY created_at DESC
    `;

    const result = await db.query(query);
    
    console.log(`📊 Found ${result.rows.length} drivers in database`);
    
    if (result.rows.length > 0) {
      console.log('\n📋 Sample driver data:');
      console.log(JSON.stringify(result.rows[0], null, 2));
      
      console.log('\n📋 All drivers:');
      result.rows.forEach((driver, index) => {
        console.log(`${index + 1}. ${driver.name} (${driver.email}) - ${driver.car_number}`);
      });
    } else {
      console.log('❌ No drivers found in database');
    }

    // Test the API response format
    const apiResponse = {
      success: true,
      data: result.rows
    };
    
    console.log('\n📋 API Response format:');
    console.log(JSON.stringify(apiResponse, null, 2));

  } catch (error) {
    console.error('❌ Error testing drivers API:', error);
  } finally {
    process.exit(0);
  }
};

testDriversApi(); 