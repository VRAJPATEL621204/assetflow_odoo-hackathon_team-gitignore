const express = require('express');
const assetController = require('../controllers/assetController');
const { authMiddleware, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', assetController.getAssets);
router.get('/:id', assetController.getAssetById);
router.post('/', requirePermission('register_asset'), assetController.registerAsset);
router.put('/:id', requirePermission('register_asset'), assetController.updateAsset);

module.exports = router;
