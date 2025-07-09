const express = require('express');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const commercialController = require('../controllers/commercialController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Commercial management routes
router.get('/', authorize('admin', 'chef_agence'), validateQuery('pagination'), commercialController.getAllCommercials);
router.get('/:id', authorize('admin', 'chef_agence', 'commercial'), commercialController.getCommercialById);
router.post('/', authorize('admin', 'chef_agence'), validate('createCommercial'), commercialController.createCommercial);
router.put('/:id', authorize('admin', 'chef_agence'), validate('updateCommercial'), commercialController.updateCommercial);
router.delete('/:id', authorize('admin'), commercialController.deleteCommercial);

// Commercial-specific routes
router.get('/:id/expediteurs', authorize('admin', 'chef_agence', 'commercial'), commercialController.getExpediteursByCommercial);
router.get('/:id/commissions', authorize('admin', 'chef_agence', 'commercial'), validateQuery('search'), commercialController.getCommissionsByCommercial);
router.get('/:id/performance', authorize('admin', 'chef_agence', 'commercial'), commercialController.getCommercialPerformance);

// Commission management
router.get('/:id/commissions/pending', authorize('admin', 'chef_agence', 'commercial'), commercialController.getPendingCommissions);
router.post('/:id/commissions/pay', authorize('admin', 'chef_agence'), commercialController.payCommission);

module.exports = router; 