const { z } = require('zod');
const assetService = require('../services/assetService');

const registerAssetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  serialNumber: z.string().max(100).optional().nullable(),
  acquisitionDate: z.string().datetime({ message: 'Invalid acquisition date format' }),
  acquisitionCost: z.number().positive('Acquisition cost must be positive'),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  status: z.enum(['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED']).optional(),
  isShared: z.boolean().optional(),
  categoryId: z.number().int(),
  departmentId: z.number().int().optional().nullable(),
  locationId: z.number().int().optional().nullable(),
  fieldValues: z.record(z.any()).optional(),
});

class AssetController {
  getAssets = async (req, res, next) => {
    try {
      const assets = await assetService.getAssets(req.query);
      return res.status(200).json({ success: true, data: assets });
    } catch (error) {
      next(error);
    }
  };

  getAssetById = async (req, res, next) => {
    try {
      const asset = await assetService.getAssetById(req.params.id);
      return res.status(200).json({ success: true, data: asset });
    } catch (error) {
      next(error);
    }
  };

  registerAsset = async (req, res, next) => {
    try {
      const validatedData = registerAssetSchema.parse(req.body);
      const asset = await assetService.registerAsset(req.user.id, validatedData);
      return res.status(201).json({ success: true, data: asset });
    } catch (error) {
      next(error);
    }
  };

  updateAsset = async (req, res, next) => {
    try {
      const asset = await assetService.updateAsset(req.user.id, req.params.id, req.body);
      return res.status(200).json({ success: true, data: asset });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AssetController();
