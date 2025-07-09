const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Hash password for admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    // Create admin user
    const adminResult = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['admin@quickzone.com', adminPassword, 'Admin', 'User', '+21612345678', 'admin']
    );
    const adminId = adminResult.rows[0].id;
    console.log('✓ Created admin user');
    
    // Create sample commercials
    const commercial1Password = await bcrypt.hash('commercial123', 12);
    const commercial1Result = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['commercial1@quickzone.com', commercial1Password, 'Ahmed', 'Ben Ali', '+21623456789', 'commercial']
    );
    const commercial1Id = commercial1Result.rows[0].id;
    
    const commercial1ProfileResult = await query(
      'INSERT INTO commercials (user_id, commission_rate) VALUES ($1, $2) RETURNING id',
      [commercial1Id, 12.5]
    );
    const commercial1ProfileId = commercial1ProfileResult.rows[0].id;
    console.log('✓ Created commercial 1');
    
    const commercial2Password = await bcrypt.hash('commercial123', 12);
    const commercial2Result = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['commercial2@quickzone.com', commercial2Password, 'Fatma', 'Trabelsi', '+21634567890', 'commercial']
    );
    const commercial2Id = commercial2Result.rows[0].id;
    
    const commercial2ProfileResult = await query(
      'INSERT INTO commercials (user_id, commission_rate) VALUES ($1, $2) RETURNING id',
      [commercial2Id, 10.0]
    );
    const commercial2ProfileId = commercial2ProfileResult.rows[0].id;
    console.log('✓ Created commercial 2');
    
    // Create sample expediteurs
    const expediteur1Password = await bcrypt.hash('expediteur123', 12);
    const expediteur1Result = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['expediteur1@quickzone.com', expediteur1Password, 'Mohamed', 'Hassan', '+21645678901', 'expediteur']
    );
    const expediteur1Id = expediteur1Result.rows[0].id;
    
    await query(
      'INSERT INTO expediteurs (user_id, commercial_id, company_name, address, city, is_verified) VALUES ($1, $2, $3, $4, $5, $6)',
      [expediteur1Id, commercial1ProfileId, 'Tech Solutions SARL', '123 Rue de la Paix', 'Tunis', true]
    );
    console.log('✓ Created expediteur 1');
    
    const expediteur2Password = await bcrypt.hash('expediteur123', 12);
    const expediteur2Result = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['expediteur2@quickzone.com', expediteur2Password, 'Sara', 'Mansouri', '+21656789012', 'expediteur']
    );
    const expediteur2Id = expediteur2Result.rows[0].id;
    
    await query(
      'INSERT INTO expediteurs (user_id, commercial_id, company_name, address, city, is_verified) VALUES ($1, $2, $3, $4, $5, $6)',
      [expediteur2Id, commercial2ProfileId, 'E-commerce Plus', '456 Avenue Habib Bourguiba', 'Sfax', true]
    );
    console.log('✓ Created expediteur 2');
    
    // Create sample livreurs
    const livreur1Password = await bcrypt.hash('livreur123', 12);
    const livreur1Result = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['livreur1@quickzone.com', livreur1Password, 'Karim', 'Bouazizi', '+21667890123', 'livreur']
    );
    const livreur1Id = livreur1Result.rows[0].id;
    
    await query(
      'INSERT INTO livreurs (user_id, vehicle_type, vehicle_plate, is_available, rating) VALUES ($1, $2, $3, $4, $5)',
      [livreur1Id, 'Motorcycle', '123TUN456', true, 4.5]
    );
    console.log('✓ Created livreur 1');
    
    const livreur2Password = await bcrypt.hash('livreur123', 12);
    const livreur2Result = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['livreur2@quickzone.com', livreur2Password, 'Youssef', 'Ben Salem', '+21678901234', 'livreur']
    );
    const livreur2Id = livreur2Result.rows[0].id;
    
    await query(
      'INSERT INTO livreurs (user_id, vehicle_type, vehicle_plate, is_available, rating) VALUES ($1, $2, $3, $4, $5)',
      [livreur2Id, 'Van', '789TUN012', true, 4.2]
    );
    console.log('✓ Created livreur 2');
    
    // Create sample colis
    const colis1Result = await query(
      `INSERT INTO colis (
        tracking_number, expediteur_id, livreur_id, commercial_id,
        weight, description, recipient_name, recipient_address,
        status, shipping_cost
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        'QZ2024001', expediteur1Id, livreur1Id, commercial1ProfileId,
        2.5, 'Electronics package', 'Ali Ben Salem', '123 Rue de la Liberté, Tunis',
        'assigned', 25.00
      ]
    );
    console.log('✓ Created sample colis 1');
    
    const colis2Result = await query(
      `INSERT INTO colis (
        tracking_number, expediteur_id, livreur_id, commercial_id,
        weight, description, recipient_name, recipient_address,
        status, shipping_cost
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        'QZ2024002', expediteur2Id, livreur2Id, commercial2ProfileId,
        1.8, 'Clothing package', 'Fatma Mansouri', '456 Avenue Habib Bourguiba, Sfax',
        'pending', 20.00
      ]
    );
    console.log('✓ Created sample colis 2');
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log('- Admin: admin@quickzone.com / admin123');
    console.log('- Commercial 1: commercial1@quickzone.com / commercial123');
    console.log('- Commercial 2: commercial2@quickzone.com / commercial123');
    console.log('- Expediteur 1: expediteur1@quickzone.com / expediteur123');
    console.log('- Expediteur 2: expediteur2@quickzone.com / expediteur123');
    console.log('- Livreur 1: livreur1@quickzone.com / livreur123');
    console.log('- Livreur 2: livreur2@quickzone.com / livreur123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase }; 