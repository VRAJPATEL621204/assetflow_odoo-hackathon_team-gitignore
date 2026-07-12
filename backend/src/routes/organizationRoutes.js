const express = require('express');
const organizationController = require('../controllers/organizationController');
const { authMiddleware, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Apply authMiddleware to all routes in this router
router.use(authMiddleware);

// --- Department Endpoints ---
router.get('/departments', organizationController.getDepartments);
router.post('/departments', requirePermission('manage_organization'), organizationController.createDepartment);
router.put('/departments/:id', requirePermission('manage_organization'), organizationController.updateDepartment);

// --- Category Endpoints ---
router.get('/categories', organizationController.getCategories);
router.post('/categories', requirePermission('manage_organization'), organizationController.createCategory);

// --- Employee Directory & Promotion Endpoints ---
router.get('/employees', organizationController.getEmployees);
router.put('/employees/:id/role', requirePermission('manage_organization'), organizationController.promoteEmployee);
router.get('/locations', organizationController.getLocations);
router.post('/locations', requirePermission('manage_organization'), organizationController.createLocation);

module.exports = router;
