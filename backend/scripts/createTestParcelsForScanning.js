const db = require('../config/database');

const createTestParcelsForScanning = async () => {
  try {
    console.log('📦 Creating test parcels for barcode scanning...\n');
    
    // Get first shipper for testing
    const shipperResult = await db.query(`
      SELECT id, name, email 
      FROM shippers 
      LIMIT 1
    `);
    
    if (shipperResult.rows.length === 0) {
      console.log('❌ No shippers found. Please create shippers first.');
      return;
    }
    
    const shipper = shipperResult.rows[0];
    console.log(`📦 Using shipper: ${shipper.name} (${shipper.email})`);
    
    // Test parcels with simple tracking numbers for easy scanning
    const testParcels = [
      {
        tracking_number: 'TEST001',
        destination: 'Tunis Centre, Tunis',
        status: 'Au dépôt', // Available for delivery missions
        weight: 1.5,
        price: 12.00,
        type: 'Standard',
        recipient_name: 'Ahmed Ben Ali',
        recipient_phone: '+216 12345678',
        recipient_address: '123 Rue Habib Bourguiba, Tunis'
      },
      {
        tracking_number: 'TEST002',
        destination: 'Sousse Médina, Sousse',
        status: 'Au dépôt',
        weight: 2.0,
        price: 15.50,
        type: 'Express',
        recipient_name: 'Fatma Mansouri',
        recipient_phone: '+216 23456789',
        recipient_address: '456 Avenue Habib Bourguiba, Sousse'
      },
      {
        tracking_number: 'TEST003',
        destination: 'Sfax Ville, Sfax',
        status: 'Au dépôt',
        weight: 0.8,
        price: 8.00,
        type: 'Document',
        recipient_name: 'Mohamed Karray',
        recipient_phone: '+216 34567890',
        recipient_address: '789 Rue de la République, Sfax'
      },
      {
        tracking_number: 'SCAN001',
        destination: 'Monastir Centre, Monastir',
        status: 'Au dépôt',
        weight: 3.2,
        price: 18.75,
        type: 'Fragile',
        recipient_name: 'Leila Trabelsi',
        recipient_phone: '+216 45678901',
        recipient_address: '321 Boulevard de la Liberté, Monastir'
      },
      {
        tracking_number: 'SCAN002',
        destination: 'Nabeul Hammamet, Nabeul',
        status: 'Au dépôt',
        weight: 1.2,
        price: 10.50,
        type: 'Standard',
        recipient_name: 'Samir Ben Salem',
        recipient_phone: '+216 56789012',
        recipient_address: '654 Avenue des Orangers, Nabeul'
      }
    ];
    
    let totalCreated = 0;
    
    for (const parcel of testParcels) {
      try {
        // Check if parcel already exists
        const existingParcel = await db.query(
          'SELECT id FROM parcels WHERE tracking_number = $1',
          [parcel.tracking_number]
        );
        
        if (existingParcel.rows.length > 0) {
          console.log(`  ⚠️  Parcel ${parcel.tracking_number} already exists, skipping...`);
          continue;
        }
        
        await db.query(`
          INSERT INTO parcels (
            tracking_number, shipper_id, destination, status, weight, price, type,
            recipient_name, recipient_phone, recipient_address,
            estimated_delivery_date, delivery_fees, return_fees, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          parcel.tracking_number,
          shipper.id,
          parcel.destination,
          parcel.status,
          parcel.weight,
          parcel.price,
          parcel.type,
          parcel.recipient_name,
          parcel.recipient_phone,
          parcel.recipient_address,
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
          parcel.price * 0.1, // 10% delivery fees
          parcel.price * 0.05  // 5% return fees
        ]);
        
        console.log(`  ✅ Created test parcel: ${parcel.tracking_number} - ${parcel.recipient_name} (${parcel.status})`);
        totalCreated++;
      } catch (error) {
        console.error(`  ❌ Error creating parcel ${parcel.tracking_number}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Summary:`);
    console.log(`   - Total test parcels created: ${totalCreated}`);
    console.log(`   - Test tracking numbers: ${testParcels.map(p => p.tracking_number).join(', ')}`);
    
    console.log('\n📱 Barcode Scanning Test Instructions:');
    console.log('1. Login with test admin: test@quickzone.tn / test123');
    console.log('2. Go to "Pick-Up Client" section');
    console.log('3. Click "Nouvelle Mission"');
    console.log('4. Click "Scanner" button');
    console.log('5. Use these test codes: TEST001, TEST002, TEST003, SCAN001, SCAN002');
    console.log('6. Or use the test button in debug mode');
    
    // Show created parcels
    console.log('\n📊 Test parcels available for scanning:');
    const testResult = await db.query(`
      SELECT tracking_number, recipient_name, destination, status, weight, price
      FROM parcels 
      WHERE tracking_number IN ('TEST001', 'TEST002', 'TEST003', 'SCAN001', 'SCAN002')
      ORDER BY tracking_number
    `);
    
    testResult.rows.forEach((parcel, index) => {
      console.log(`${index + 1}. ${parcel.tracking_number} - ${parcel.recipient_name} - ${parcel.destination} (${parcel.status})`);
    });
    
  } catch (error) {
    console.error('❌ Error creating test parcels:', error);
  } finally {
    process.exit(0);
  }
};

createTestParcelsForScanning(); 