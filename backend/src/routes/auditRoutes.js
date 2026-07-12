const express = require('express');
const auditController = require('../controllers/auditController');
const { authMiddleware, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/cycles', auditController.getCycles);
router.post('/cycles', requirePermission('create_audit'), auditController.createCycle);
router.put('/cycles/:id/close', requirePermission('create_audit'), auditController.closeCycle);

router.post('/verify', requirePermission('perform_audit'), auditController.verifyAsset);

module.exports = router;
