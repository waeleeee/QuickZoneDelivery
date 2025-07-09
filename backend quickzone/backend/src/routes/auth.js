const express = require('express');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/login', validate('login'), authController.login);
router.post('/register', validate('createUser'), authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.get('/me', authenticateToken, authController.getProfile);
router.put('/me', authenticateToken, validate('updateUser'), authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);
router.post('/logout', authenticateToken, authController.logout);

// Admin only routes
router.get('/users', authenticateToken, authorize('admin', 'chef_agence'), authController.getAllUsers);
router.get('/users/:id', authenticateToken, authorize('admin', 'chef_agence'), authController.getUserById);
router.put('/users/:id', authenticateToken, authorize('admin', 'chef_agence'), validate('updateUser'), authController.updateUser);
router.delete('/users/:id', authenticateToken, authorize('admin'), authController.deleteUser);

module.exports = router; 