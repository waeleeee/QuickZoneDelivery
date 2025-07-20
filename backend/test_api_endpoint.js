const axios = require('axios');

async function testSecurityCodeAPI() {
  try {
    console.log('🧪 Testing security code API endpoint...');
    
    // Test the security code endpoint for mission ID 16 (from the previous test)
    const response = await axios.get('http://localhost:5000/api/missions-pickup/16/security-code');
    
    console.log('📡 API Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Security code generated successfully:', response.data.data.securityCode);
    } else {
      console.log('❌ API returned error:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ API call failed:', error.message);
    if (error.response) {
      console.error('❌ Response data:', error.response.data);
      console.error('❌ Response status:', error.response.status);
    }
  }
}

testSecurityCodeAPI(); 