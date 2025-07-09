const { query } = require('./src/config/database');

async function createTables() {
  try {
    console.log('Creating basic tables...');
    
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');
    
    // Create commercials table
    await query(`
      CREATE TABLE IF NOT EXISTS commercials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        commission_rate DECIMAL(5,2) DEFAULT 10.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Commercials table created');
    
    // Create expediteurs table
    await query(`
      CREATE TABLE IF NOT EXISTS expediteurs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        commercial_id UUID REFERENCES commercials(id),
        company_name VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Expediteurs table created');
    
    // Create livreurs table
    await query(`
      CREATE TABLE IF NOT EXISTS livreurs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        vehicle_type VARCHAR(50),
        vehicle_plate VARCHAR(20),
        is_available BOOLEAN DEFAULT true,
        rating DECIMAL(3,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Livreurs table created');
    
    // Create colis table
    await query(`
      CREATE TABLE IF NOT EXISTS colis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tracking_number VARCHAR(50) UNIQUE NOT NULL,
        expediteur_id UUID REFERENCES expediteurs(id),
        livreur_id UUID REFERENCES livreurs(id),
        commercial_id UUID REFERENCES commercials(id),
        weight DECIMAL(8,2),
        description TEXT,
        recipient_name VARCHAR(255) NOT NULL,
        recipient_address TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        shipping_cost DECIMAL(8,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Colis table created');
    
    console.log('✅ All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

createTables(); 