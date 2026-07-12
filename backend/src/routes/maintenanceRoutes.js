const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');
const { authMiddleware, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/requests', maintenanceController.getRequests);
router.post('/requests', requirePermission('raise_maintenance'), maintenanceController.createRequest);

router.get('/technicians', maintenanceController.getTechnicians);
router.post('/technicians', requirePermission('manage_organization'), maintenanceController.createTechnician);
router.put('/requests/:id', requirePermission('approve_maintenance'), maintenanceController.updateRequest);

module.exports = router;
