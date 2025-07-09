const express = require('express');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const livreurController = require('../controllers/livreurController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Livreur management routes
router.get('/', authorize('admin', 'chef_agence'), validateQuery('pagination'), livreurController.getAllLivreurs);
router.get('/:id', authorize('admin', 'chef_agence', 'livreur'), livreurController.getLivreurById);
router.post('/', authorize('admin', 'chef_agence'), validate('createLivreur'), livreurController.createLivreur);
router.put('/:id', authorize('admin', 'chef_agence', 'livreur'), validate('updateLivreur'), livreurController.updateLivreur);
router.delete('/:id', authorize('admin'), livreurController.deleteLivreur);

// Livreur-specific routes
router.get('/:id/missions', authorize('admin', 'chef_agence', 'livreur'), validateQuery('search'), livreurController.getMissionsByLivreur);
router.get('/:id/colis', authorize('admin', 'chef_agence', 'livreur'), validateQuery('search'), livreurController.getColisByLivreur);
router.get('/:id/performance', authorize('admin', 'chef_agence', 'livreur'), livreurController.getLivreurPerformance);

// Availability and location management
router.patch('/:id/availability', authorize('livreur'), livreurController.updateAvailability);
router.patch('/:id/location', authorize('livreur'), livreurController.updateLocation);

// Search and filtering
router.get('/search/available', authorize('admin', 'chef_agence'), livreurController.getAvailableLivreurs);
router.get('/search/by-vehicle', authorize('admin', 'chef_agence'), livreurController.getLivreursByVehicle);
router.get('/search/by-rating', authorize('admin', 'chef_agence'), livreurController.getLivreursByRating);

module.exports = router; 