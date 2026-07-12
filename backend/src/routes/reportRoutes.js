const express = require('express');
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', reportController.getDashboardSummary);
router.get('/utilization', reportController.getCategoryUtilization);
router.get('/dept-utilization', reportController.getDeptUtilization);
router.get('/maintenance-frequency', reportController.getMaintenanceFrequency);
router.get('/notifications', reportController.getNotifications);
router.put('/notifications/read', reportController.markNotificationsRead);
router.put('/notifications/:id/read', reportController.markOneRead);
router.post('/notifications/alert', reportController.createAlert);
router.post('/notifications/seed-contextual', reportController.seedContextualNotifications);

module.exports = router;
