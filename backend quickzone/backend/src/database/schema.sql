-- QuickZone Database Schema
-- PostgreSQL Database for Parcel Delivery Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (base user information)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'chef_agence', 'commercial', 'livreur', 'expediteur')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commercials table (extends users with commercial-specific data)
CREATE TABLE IF NOT EXISTS commercials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Default 10% commission
    total_commission_earned DECIMAL(10,2) DEFAULT 0.00,
    total_parcels_brought INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expediteurs table (shippers)
CREATE TABLE IF NOT EXISTS expediteurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    commercial_id UUID REFERENCES commercials(id) ON DELETE SET NULL,
    company_name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Tunisia',
    total_parcels_sent INTEGER DEFAULT 0,
    total_amount_spent DECIMAL(10,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Livreurs table (delivery drivers)
CREATE TABLE IF NOT EXISTS livreurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50),
    vehicle_plate VARCHAR(20),
    license_number VARCHAR(50),
    current_location_lat DECIMAL(10,8),
    current_location_lng DECIMAL(11,8),
    is_available BOOLEAN DEFAULT true,
    total_deliveries INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Missions table (delivery missions assigned to livreurs)
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    livreur_id UUID REFERENCES livreurs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'refused', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    estimated_duration INTEGER, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Colis table (parcels)
CREATE TABLE IF NOT EXISTS colis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    expediteur_id UUID REFERENCES expediteurs(id) ON DELETE CASCADE,
    livreur_id UUID REFERENCES livreurs(id) ON DELETE SET NULL,
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    commercial_id UUID REFERENCES commercials(id) ON DELETE SET NULL,
    
    -- Parcel details
    weight DECIMAL(8,2), -- in kg
    dimensions VARCHAR(100), -- format: "LxWxH cm"
    description TEXT,
    declared_value DECIMAL(10,2),
    
    -- Delivery details
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(20),
    recipient_address TEXT NOT NULL,
    recipient_city VARCHAR(100) NOT NULL,
    recipient_postal_code VARCHAR(20),
    
    -- Status and tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned')),
    current_location VARCHAR(255),
    
    -- Financial
    shipping_cost DECIMAL(8,2) NOT NULL,
    commission_amount DECIMAL(8,2) DEFAULT 0.00,
    commission_paid BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    estimated_delivery_date DATE
);

-- Colis Missions junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS colis_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colis_id UUID REFERENCES colis(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'refused', 'completed')),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(colis_id, mission_id)
);

-- Colis tracking history
CREATE TABLE IF NOT EXISTS colis_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colis_id UUID REFERENCES colis(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediteur_id UUID REFERENCES expediteurs(id) ON DELETE CASCADE,
    colis_id UUID REFERENCES colis(id) ON DELETE CASCADE,
    commercial_id UUID REFERENCES commercials(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(50) DEFAULT 'cash' CHECK (payment_type IN ('cash', 'card', 'bank_transfer', 'mobile_money')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    commission_amount DECIMAL(8,2) DEFAULT 0.00,
    commission_paid BOOLEAN DEFAULT false,
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reclamations table (complaints)
CREATE TABLE IF NOT EXISTS reclamations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediteur_id UUID REFERENCES expediteurs(id) ON DELETE CASCADE,
    colis_id UUID REFERENCES colis(id) ON DELETE CASCADE,
    livreur_id UUID REFERENCES livreurs(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Sectors table (geographic areas)
CREATE TABLE IF NOT EXISTS secteurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    city VARCHAR(100) NOT NULL,
    postal_codes TEXT[], -- Array of postal codes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entrepots table (warehouses)
CREATE TABLE IF NOT EXISTS entrepots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_id UUID REFERENCES users(id),
    capacity INTEGER, -- Maximum number of parcels
    current_occupancy INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_colis_tracking_number ON colis(tracking_number);
CREATE INDEX idx_colis_status ON colis(status);
CREATE INDEX idx_colis_expediteur_id ON colis(expediteur_id);
CREATE INDEX idx_colis_livreur_id ON colis(livreur_id);
CREATE INDEX idx_missions_livreur_id ON missions(livreur_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_expediteurs_commercial_id ON expediteurs(commercial_id);
CREATE INDEX idx_payments_expediteur_id ON payments(expediteur_id);
CREATE INDEX idx_payments_colis_id ON payments(colis_id);
CREATE INDEX idx_colis_tracking_colis_id ON colis_tracking(colis_id);
CREATE INDEX idx_reclamations_colis_id ON reclamations(colis_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commercials_updated_at BEFORE UPDATE ON commercials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expediteurs_updated_at BEFORE UPDATE ON expediteurs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_livreurs_updated_at BEFORE UPDATE ON livreurs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_colis_updated_at BEFORE UPDATE ON colis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reclamations_updated_at BEFORE UPDATE ON reclamations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_secteurs_updated_at BEFORE UPDATE ON secteurs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entrepots_updated_at BEFORE UPDATE ON entrepots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 