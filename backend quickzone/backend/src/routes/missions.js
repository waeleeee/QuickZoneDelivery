const express = require('express');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const missionController = require('../controllers/missionController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Mission management routes
router.get('/', authorize('admin', 'chef_agence'), validateQuery('pagination'), missionController.getAllMissions);
router.get('/:id', authorize('admin', 'chef_agence', 'livreur'), missionController.getMissionById);
router.post('/', authorize('admin', 'chef_agence'), validate('createMission'), missionController.createMission);
router.put('/:id', authorize('admin', 'chef_agence'), validate('updateMission'), missionController.updateMission);
router.delete('/:id', authorize('admin'), missionController.deleteMission);

// Mission status management
router.patch('/:id/accept', authorize('livreur'), missionController.acceptMission);
router.patch('/:id/refuse', authorize('livreur'), missionController.refuseMission);
router.patch('/:id/start', authorize('livreur'), missionController.startMission);
router.patch('/:id/complete', authorize('livreur'), missionController.completeMission);
router.patch('/:id/cancel', authorize('admin', 'chef_agence'), missionController.cancelMission);

// Mission-specific routes
router.get('/:id/colis', authorize('admin', 'chef_agence', 'livreur'), missionController.getColisByMission);
router.post('/:id/assign-colis', authorize('admin', 'chef_agence'), missionController.assignColisToMission);

// Search and filtering
router.get('/search/by-livreur', authorize('admin', 'chef_agence'), missionController.getMissionsByLivreur);
router.get('/search/by-status', authorize('admin', 'chef_agence'), missionController.getMissionsByStatus);
router.get('/search/pending', authorize('admin', 'chef_agence'), missionController.getPendingMissions);

module.exports = router; 