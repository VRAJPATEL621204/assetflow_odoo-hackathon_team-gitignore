const express = require('express');
const allocationController = require('../controllers/allocationController');
const { authMiddleware, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// --- Allocations ---
router.get('/', allocationController.getAllocations);
router.post('/', requirePermission('allocate_asset'), allocationController.allocateAsset);
router.put('/:id/return', requirePermission('allocate_asset'), allocationController.returnAsset);

// --- Transfers ---
router.get('/transfers', allocationController.getTransferRequests);
router.post('/transfers', allocationController.createTransferRequest);
router.put('/transfers/:id/approve', requirePermission('approve_transfer'), allocationController.approveTransfer);
router.put('/transfers/:id/reject', requirePermission('approve_transfer'), allocationController.rejectTransfer);

module.exports = router;
