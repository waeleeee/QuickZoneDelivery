const express = require('express');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const colisController = require('../controllers/colisController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public colis routes (for tracking)
router.get('/track/:trackingNumber', colisController.trackColis);

// Colis management routes
router.get('/', validateQuery('pagination'), colisController.getAllColis);
router.get('/:id', colisController.getColisById);
router.post('/', authorize('admin', 'chef_agence', 'commercial', 'expediteur'), validate('createColis'), colisController.createColis);
router.put('/:id', authorize('admin', 'chef_agence', 'commercial'), validate('updateColis'), colisController.updateColis);
router.delete('/:id', authorize('admin'), colisController.deleteColis);

// Colis status management
router.patch('/:id/assign', authorize('admin', 'chef_agence'), colisController.assignColis);
router.patch('/:id/pickup', authorize('livreur'), colisController.pickupColis);
router.patch('/:id/deliver', authorize('livreur'), colisController.deliverColis);
router.patch('/:id/fail', authorize('livreur'), colisController.failColis);
router.patch('/:id/return', authorize('livreur'), colisController.returnColis);

// Colis tracking and history
router.get('/:id/tracking', colisController.getColisTracking);
router.post('/:id/tracking', authorize('admin', 'chef_agence', 'livreur'), colisController.addTrackingEvent);

// Colis search and filtering
router.get('/search/expediteur', authorize('commercial'), colisController.getColisByExpediteur);
router.get('/search/livreur', authorize('admin', 'chef_agence'), colisController.getColisByLivreur);
router.get('/search/status', validateQuery('search'), colisController.getColisByStatus);

// Colis statistics
router.get('/stats/overview', colisController.getColisStats);
router.get('/stats/by-status', colisController.getColisStatsByStatus);
router.get('/stats/by-date', validateQuery('search'), colisController.getColisStatsByDate);

module.exports = router; 