const express = require('express');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateQuery } = require('../middleware/validation');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// General dashboard statistics
router.get('/stats', dashboardController.getGeneralStats);

// Role-specific dashboards
router.get('/admin', authorize('admin'), dashboardController.getAdminDashboard);
router.get('/chef-agence', authorize('chef_agence'), dashboardController.getChefAgenceDashboard);
router.get('/commercial', authorize('commercial'), dashboardController.getCommercialDashboard);
router.get('/livreur', authorize('livreur'), dashboardController.getLivreurDashboard);
router.get('/expediteur', authorize('expediteur'), dashboardController.getExpediteurDashboard);

// Analytics and reports
router.get('/analytics/colis', validateQuery('search'), dashboardController.getColisAnalytics);
router.get('/analytics/revenue', validateQuery('search'), dashboardController.getRevenueAnalytics);
router.get('/analytics/performance', validateQuery('search'), dashboardController.getPerformanceAnalytics);

// Charts and visualizations
router.get('/charts/colis-status', dashboardController.getColisStatusChart);
router.get('/charts/revenue-trend', validateQuery('search'), dashboardController.getRevenueTrendChart);
router.get('/charts/delivery-performance', validateQuery('search'), dashboardController.getDeliveryPerformanceChart);
router.get('/charts/geographic-distribution', dashboardController.getGeographicDistributionChart);

// Real-time data
router.get('/realtime/active-missions', dashboardController.getActiveMissions);
router.get('/realtime/pending-colis', dashboardController.getPendingColis);
router.get('/realtime/available-livreurs', dashboardController.getAvailableLivreurs);

module.exports = router; 