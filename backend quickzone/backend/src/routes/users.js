const express = require('express');
const { authenticateToken, authorize, canManageUser } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const userController = require('../controllers/userController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User management routes (admin and chef_agence only)
router.get('/', authorize('admin', 'chef_agence'), validateQuery('pagination'), userController.getAllUsers);
router.get('/:id', authorize('admin', 'chef_agence'), userController.getUserById);
router.post('/', authorize('admin', 'chef_agence'), validate('createUser'), userController.createUser);
router.put('/:id', authorize('admin', 'chef_agence'), canManageUser, validate('updateUser'), userController.updateUser);
router.delete('/:id', authorize('admin'), canManageUser, userController.deleteUser);

// User activation/deactivation
router.patch('/:id/activate', authorize('admin', 'chef_agence'), canManageUser, userController.activateUser);
router.patch('/:id/deactivate', authorize('admin', 'chef_agence'), canManageUser, userController.deactivateUser);

module.exports = router; 