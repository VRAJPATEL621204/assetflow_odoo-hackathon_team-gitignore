const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public endpoints
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected endpoints
router.get('/profile', authMiddleware, userController.getProfile);

module.exports = router;
