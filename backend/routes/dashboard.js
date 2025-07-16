const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total users
    const usersResult = await db.query(`
      SELECT COUNT(*) as total_users,
             COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as new_users_this_month
      FROM users WHERE is_active = true
    `);

    // Get total parcels
    const parcelsResult = await db.query(`
      SELECT COUNT(*) as total_parcels,
             COUNT(CASE WHEN created_date >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as new_parcels_this_month,
             COUNT(CASE WHEN status = 'Livrés' THEN 1 END) as delivered_parcels,
             COUNT(CASE WHEN status = 'Livrés' AND actual_delivery_date >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as delivered_this_month
      FROM parcels
    `);

    // Get total shippers
    const shippersResult = await db.query(`
      SELECT COUNT(*) as total_shippers,
             COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as new_shippers_this_month
      FROM shippers WHERE status = 'Actif'
    `);

    // Get monthly revenue
    const revenueResult = await db.query(`
      SELECT COALESCE(SUM(amount), 0) as monthly_revenue,
             COALESCE(SUM(CASE WHEN date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN amount END), 0) as last_month_revenue
      FROM payments WHERE status = 'Payé'
    `);

    // Get delivery performance
    const performanceResult = await db.query(`
      SELECT 
        COUNT(*) as total_deliveries,
        COUNT(CASE WHEN status = 'Livrés' THEN 1 END) as successful_deliveries,
        ROUND(
          (COUNT(CASE WHEN status = 'Livrés' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as success_rate
      FROM parcels 
      WHERE created_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')
    `);

    // Get geographic distribution
    const geoResult = await db.query(`
      SELECT 
        destination,
        COUNT(*) as parcel_count
      FROM parcels 
      WHERE created_date >= DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY destination 
      ORDER BY parcel_count DESC 
      LIMIT 5
    `);

    // Get parcel status distribution
    const statusResult = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM parcels 
      GROUP BY status 
      ORDER BY count DESC
    `);

    // Calculate growth percentages
    const users = usersResult.rows[0];
    const parcels = parcelsResult.rows[0];
    const shippers = shippersResult.rows[0];
    const revenue = revenueResult.rows[0];
    const performance = performanceResult.rows[0];

    // Calculate month-over-month growth
    const lastMonthUsers = Math.max(users.total_users - users.new_users_this_month, 1);
    const lastMonthParcels = Math.max(parcels.total_parcels - parcels.new_parcels_this_month, 1);
    const lastMonthShippers = Math.max(shippers.total_shippers - shippers.new_shippers_this_month, 1);
    const lastMonthDelivered = Math.max(parcels.delivered_parcels - parcels.delivered_this_month, 1);

    const userGrowth = Math.round(((users.new_users_this_month / lastMonthUsers) * 100) * 100) / 100;
    const parcelGrowth = Math.round(((parcels.new_parcels_this_month / lastMonthParcels) * 100) * 100) / 100;
    const shipperGrowth = Math.round(((shippers.new_shippers_this_month / lastMonthShippers) * 100) * 100) / 100;
    const deliveryGrowth = Math.round(((parcels.delivered_this_month / lastMonthDelivered) * 100) * 100) / 100;
    const revenueGrowth = revenue.last_month_revenue > 0 
      ? Math.round(((revenue.monthly_revenue - revenue.last_month_revenue) / revenue.last_month_revenue * 100) * 100) / 100
      : 0;

    const stats = {
      users: {
        total: parseInt(users.total_users),
        newThisMonth: parseInt(users.new_users_this_month),
        growth: userGrowth
      },
      parcels: {
        total: parseInt(parcels.total_parcels),
        newThisMonth: parseInt(parcels.new_parcels_this_month),
        delivered: parseInt(parcels.delivered_parcels),
        deliveredThisMonth: parseInt(parcels.delivered_this_month),
        growth: parcelGrowth,
        deliveryGrowth: deliveryGrowth
      },
      shippers: {
        total: parseInt(shippers.total_shippers),
        newThisMonth: parseInt(shippers.new_shippers_this_month),
        growth: shipperGrowth
      },
      revenue: {
        monthly: parseFloat(revenue.monthly_revenue),
        growth: revenueGrowth
      },
      performance: {
        successRate: parseFloat(performance.success_rate) || 0,
        totalDeliveries: parseInt(performance.total_deliveries),
        successfulDeliveries: parseInt(performance.successful_deliveries)
      },
      geographic: geoResult.rows,
      statusDistribution: statusResult.rows
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

// Get recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent parcels
    const recentParcels = await db.query(`
      SELECT 
        p.tracking_number,
        p.destination,
        p.status,
        p.created_date,
        s.name as shipper_name
      FROM parcels p
      JOIN shippers s ON p.shipper_id = s.id
      ORDER BY p.created_date DESC
      LIMIT $1
    `, [limit]);

    // Get recent payments
    const recentPayments = await db.query(`
      SELECT 
        p.amount,
        p.date,
        p.status,
        p.payment_method,
        s.name as shipper_name
      FROM payments p
      JOIN shippers s ON p.shipper_id = s.id
      ORDER BY p.date DESC
      LIMIT $1
    `, [limit]);

    // Get recent complaints
    const recentComplaints = await db.query(`
      SELECT 
        c.subject,
        c.status,
        c.date,
        s.name as client_name
      FROM complaints c
      JOIN shippers s ON c.client_id = s.id
      ORDER BY c.date DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: {
        recentParcels: recentParcels.rows,
        recentPayments: recentPayments.rows,
        recentComplaints: recentComplaints.rows
      }
    });

  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ error: 'Failed to get recent activity' });
  }
});

// Get performance metrics
router.get('/performance', async (req, res) => {
  try {
    const period = req.query.period || 'month'; // month, quarter, year

    let dateFilter;
    switch (period) {
      case 'quarter':
        dateFilter = "DATE_TRUNC('quarter', CURRENT_DATE)";
        break;
      case 'year':
        dateFilter = "DATE_TRUNC('year', CURRENT_DATE)";
        break;
      default:
        dateFilter = "DATE_TRUNC('month', CURRENT_DATE)";
    }

    // Delivery performance
    const deliveryPerformance = await db.query(`
      SELECT 
        COUNT(*) as total_parcels,
        COUNT(CASE WHEN status = 'Livrés' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'En cours' THEN 1 END) as in_transit,
        COUNT(CASE WHEN status = 'En attente' THEN 1 END) as pending,
        ROUND(
          (COUNT(CASE WHEN status = 'Livrés' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as success_rate
      FROM parcels 
      WHERE created_date >= ${dateFilter}
    `);

    // Revenue performance
    const revenuePerformance = await db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COUNT(*) as total_payments,
        COALESCE(AVG(amount), 0) as average_payment,
        COUNT(CASE WHEN status = 'Payé' THEN 1 END) as completed_payments
      FROM payments 
      WHERE date >= ${dateFilter}
    `);

    // Customer satisfaction (based on complaints)
    const satisfactionResult = await db.query(`
      SELECT 
        COUNT(*) as total_complaints,
        COUNT(CASE WHEN status = 'Traitée' THEN 1 END) as resolved_complaints,
        ROUND(
          (COUNT(CASE WHEN status = 'Traitée' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as resolution_rate
      FROM complaints 
      WHERE date >= ${dateFilter}
    `);

    res.json({
      success: true,
      data: {
        delivery: deliveryPerformance.rows[0],
        revenue: revenuePerformance.rows[0],
        satisfaction: satisfactionResult.rows[0],
        period: period
      }
    });

  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
});

// Get admin dashboard data
router.get('/admin', async (req, res) => {
  try {
    // Get key metrics
    const parcelsResult = await db.query(`
      SELECT COUNT(*) as total_parcels,
             COUNT(CASE WHEN status = 'Livrés' THEN 1 END) as delivered_parcels
      FROM parcels
    `);
    
    const driversResult = await db.query(`
      SELECT COUNT(*) as total_drivers,
             COUNT(CASE WHEN status = 'Disponible' THEN 1 END) as active_drivers
      FROM drivers
    `);
    
    const shippersResult = await db.query(`
      SELECT COUNT(*) as total_shippers
      FROM shippers WHERE status = 'Actif'
    `);
    
    // Get top drivers
    const topDrivers = await db.query(`
      SELECT d.name, COUNT(p.id) as delivery_count
      FROM drivers d
      LEFT JOIN pickup_missions pm ON d.id = pm.driver_id
      LEFT JOIN parcels p ON pm.id = p.id
      WHERE p.status = 'Livrés'
      GROUP BY d.id, d.name
      ORDER BY delivery_count DESC
      LIMIT 5
    `);
    
    // Get recent activities
    const recentParcels = await db.query(`
      SELECT p.tracking_number, p.status, p.created_date, s.name as shipper_name
      FROM parcels p
      LEFT JOIN shippers s ON p.shipper_id = s.id
      ORDER BY p.created_date DESC
      LIMIT 5
    `);
    
    const keyMetrics = {
      totalColis: parseInt(parcelsResult.rows[0].total_parcels),
      livreursActifs: parseInt(driversResult.rows[0].active_drivers),
      livraisonsCompletees: parseInt(parcelsResult.rows[0].delivered_parcels),
      tauxSatisfaction: 98.5, // Mock for now
      colisGrowth: "+12% ce mois",
      livreursGrowth: "+8% cette semaine", 
      livraisonsGrowth: "+15% aujourd'hui",
      satisfactionGrowth: "+2.3% ce mois"
    };
    
    const topLivreurs = topDrivers.rows.map((driver, index) => ({
      rank: index + 1,
      name: driver.name,
      livraisons: parseInt(driver.delivery_count) || 0
    }));
    
    const recentActivities = recentParcels.rows.map(parcel => ({
      type: parcel.status === 'Livrés' ? 'delivered' : 'created',
      message: `Colis #${parcel.tracking_number} ${parcel.status.toLowerCase()}`,
      time: new Date(parcel.created_date).toLocaleString('fr-FR'),
      color: parcel.status === 'Livrés' ? 'green' : 'blue'
    }));
    
    res.json({
      success: true,
      data: {
        keyMetrics,
        topLivreurs,
        recentActivities
      }
    });
    
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin dashboard data'
    });
  }
});

module.exports = router; 