const express = require('express');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const expediteurController = require('../controllers/expediteurController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Expediteur management routes
router.get('/', authorize('admin', 'chef_agence', 'commercial'), validateQuery('pagination'), expediteurController.getAllExpediteurs);
router.get('/:id', authorize('admin', 'chef_agence', 'commercial', 'expediteur'), expediteurController.getExpediteurById);
router.post('/', authorize('admin', 'chef_agence', 'commercial'), validate('createExpediteur'), expediteurController.createExpediteur);
router.put('/:id', authorize('admin', 'chef_agence', 'commercial'), validate('updateExpediteur'), expediteurController.updateExpediteur);
router.delete('/:id', authorize('admin'), expediteurController.deleteExpediteur);

// Expediteur-specific routes
router.get('/:id/colis', authorize('admin', 'chef_agence', 'commercial', 'expediteur'), validateQuery('search'), expediteurController.getColisByExpediteur);
router.get('/:id/payments', authorize('admin', 'chef_agence', 'commercial', 'expediteur'), validateQuery('search'), expediteurController.getPaymentsByExpediteur);
router.get('/:id/statistics', authorize('admin', 'chef_agence', 'commercial', 'expediteur'), expediteurController.getExpediteurStatistics);

// Advanced filtering
router.get('/search/by-commercial', authorize('admin', 'chef_agence', 'commercial'), expediteurController.getExpediteursByCommercial);
router.get('/search/by-city', authorize('admin', 'chef_agence', 'commercial'), expediteurController.getExpediteursByCity);
router.get('/search/verified', authorize('admin', 'chef_agence', 'commercial'), expediteurController.getVerifiedExpediteurs);

// Verification management
router.patch('/:id/verify', authorize('admin', 'chef_agence'), expediteurController.verifyExpediteur);
router.patch('/:id/unverify', authorize('admin', 'chef_agence'), expediteurController.unverifyExpediteur);

module.exports = router; 